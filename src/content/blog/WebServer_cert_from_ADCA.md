---
title: "Generate a web server certificate signed by Microsoft Certificate Authority"
description: "Use openssl to generate a certificate request, Microsoft Certificate Authority to sign the request, Apache to use the certificate"
pubDate: 2024-10-22
# updatedDate: 2024-10-22
tags: [ "https", "ssl", "openssl", "Microsoft Certificate Authority" ]
---

These instructions can be used to generate a certificate for a web server.
The certificate is signed by a `Microsoft Certificate Authority` from an `Active Directory` domain.
The signed certificate can be used by any web server.

- [Generate a private key and a certificate request](#generate-a-private-key-and-a-certificate-request)
- [Sign the request](#sign-the-request)
- [Copy the signed certificate in a common location](#copy-the-signed-certificate-in-a-common-location)
- [Example: add the certificate to Apache web server](#example-add-the-certificate-to-apache-web-server)
- [The root CA certificate](#the-root-ca-certificate)

The example data is:

- web server name: `www.example.local`
- certificate name: `example_web_cert`
- server that host the Certificate Authority: `caserver.example.local`
- name of the Certificate Authority: `example-CA`
- name of the certificate template: `WebServer`

## Generate a private key and a certificate request

```sh
openssl req -new -sha256 -newkey rsa:2048 -noenc \
    -subj '/CN=www.example.local' \
    -addext 'subjectAltName = DNS:www.example.local' \
    -keyout example_web_cert.key -out example_web_cert.csr
```

`man openssl req` gives more information about the parameters but this may be enough:

- `-subj` is used to give the subject attribute on command line avoiding the dialog about the name
- the `subjectAltName` certificate extension is added with `-addext`
- `-sha256` is the digest to use when signing the request. To see the list of supported digest algorithms use `openssl list -digest-algorithms`
- `rsa:2048` is the type and size of private key
- `-noenc` is used to **not** encrypt the private key

To verify the certificate request use:

```sh
openssl req -in example_web_cert.csr -text -verify -noout
```

**Note:** you can add the server's IP address to the `subjectAltName`. Example: `DNS:www.example.local,IP:192.168.1.28`

## Sign the request

Copy the certificate request to a domain joined Windows machine and start a `command prompt` / `powershell` as a **user with the right to enroll the web server certificate** ! - see the **Note 2**

```ps1
certreq -submit -attrib "CertificateTemplate:WebServer" -config "caserver.example.local\example-CA" example_web_cert.csr example_web_cert.crt
```

If everything is OK you should get an answer like this:

```txt
RequestId: 12345
RequestId: "12345"
Certificate retrieved(Issued) Issued
```

**Note 1**: the name of the template may not be `WebServer` or someone might have configured additional templates for web servers. Start the `Certificate Authority` console to check available templates, add new ones or manage them.

**Note 2**: `certreq submit` must be launched from a user account with `Enroll` right for the `WebServer` template. Start the `Certificate Authority` console to check the permissions for the template you want to use.

## Copy the signed certificate in a common location

The signed certificate and its private key should be put in a location accessible to your web server (`Apache`, `Nginx`, ...) and protected from unwanted access. Example:

```sh
sudo cp example_web_cert.crt /etc/ssl/certs/
sudo chmod 400 /etc/ssl/certs/example_web_cert.crt
sudo cp example_web_cert.key /etc/ssl/private/
sudo chmod 400 /etc/ssl/private/example_web_cert.key
```

## Example: add the certificate to Apache web server

For `Apache`, in a `<VirtualHost>`, add:

```txt
    SSLEngine on
    SSLCipherSuite HIGH:!aNULL:!MD5
    SSLCertificateFile /etc/ssl/certs/example_web_cert.crt
    SSLCertificateKeyFile /etc/ssl/private/example_web_cert.key
```

Do not forget to activate the SSL engine, test the new configuration and load it:

```sh
sudo a2enmod ssl
apachectl configtest
sudo systemctl reload apache2
```

**Note**: to access the web server by its name, make sure the DNS is properly configured.

## The root CA certificate

If the certificate authority's root certificate is not trusted in your system, it's certificate can be installed with:

```sh
root_ca_cert_name='example-CA.crt'
if ! command -v update-ca-certificates >/dev/null 2>&1; then
    sudo apt -y install ca-certificates
fi
sudo cp "$root_ca_cert_name" /usr/local/share/ca-certificates
sudo update-ca-certificates
```
