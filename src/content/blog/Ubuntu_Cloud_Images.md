---
title: "Ubuntu Cloud Images"
description: "Ubuntu Cloud Images are the official Ubuntu images customized by Canonical to run on public clouds, Openstack, LXD and more."
pubDate: 2024-11-03
updatedDate: 2024-11-05
tags: [ "Cloud Images", "Ubuntu", "gpg" ]
---

> [Ubuntu Cloud Images](https://cloud-images.ubuntu.com) are the official Ubuntu images that have been customised by Canonical to run on [public clouds](https://cloud-images.ubuntu.com/locator/) that provide Ubuntu Certified Images, Openstack, LXD and more.

- [Select image](#select-image)
- [Download image](#download-image)
- [Verify image](#verify-image)
- [Next step](#next-step)

## Select image

The [Ubuntu Cloud Images](https://cloud-images.ubuntu.com) site contains many images and the [Image locator](https://cloud-images.ubuntu.com/locator/) should be helpful ... and probably is but I prefer to select the minimal or standard server releases:

- [Ubuntu Minimal 24.04 LTS (Nomble Numbat)](https://cloud-images.ubuntu.com/minimal/releases/noble/release/)
- [Ubuntu 24.04 LTS (Noble Numbat)](https://cloud-images.ubuntu.com/noble/current/)

and while I am there, I download the file with the hashes and its signature. Example:

- QCow2 UEFI/GPT Bootable disk image [noble-server-cloudimg-amd64.img](https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img)
- File system image and Kernel packed [noble-server-cloudimg-amd64.tar.gz](https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.tar.gz)
- Hashes [SHA256SUMS](https://cloud-images.ubuntu.com/noble/current/SHA256SUMS)
- Signature of the file with hashes [SHA256SUMS.gpg](https://cloud-images.ubuntu.com/noble/current/SHA256SUMS.gpg)

**Note:** the same file may have multiple names, depending on the link where it is accessed.
Example: [noble-server-cloudimg-amd64.img](https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img) have the same content as [ubuntu-24.04-server-cloudimg-amd64.img](
https://cloud-images.ubuntu.com/releases/24.04/release/ubuntu-24.04-server-cloudimg-amd64.img) .Check the hashes if you want.

## Download image

```sh
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
wget https://cloud-images.ubuntu.com/noble/current/SHA256SUMS
wget https://cloud-images.ubuntu.com/noble/current/SHA256SUMS.gpg
```

Make the downloaded image read-only because if you test it with [QEMU](https://www.qemu.org/) or another tool it may be modified.

```sh
chmod 400 noble-server-cloudimg-amd64.img
```

## Verify image

First check the integrity of `SHA256SUMS`:

```sh
gpg --keyid-format long --verify SHA256SUMS.gpg SHA256SUMS
```

If you get a message like:

```ansi
[0;2mgpg: Signature made Mi 09 oct 2024 03:23:30 +0300 EEST[0m
[0;1mgpg:                using RSA key D2EB44626FDDC30B513D5BB71A5D6C4C7DB87C81[0m
[0;91mgpg: Can't check signature: No public key[0m
```

then you have to install the missing key:

```ansi
[0;92mgpg --keyid-format long \
    --keyserver hkp://keyserver.ubuntu.com \
    --recv-keys 0xD2EB44626FDDC30B513D5BB71A5D6C4C7DB87C81[0m

[0;1mgpg: key 1A5D6C4C7DB87C81: public key "UEC Image Automatic Signing Key <cdimage@ubuntu.com>" imported[0m
[0;2mgpg: Total number processed: 1[0m
[0;2mgpg:               imported: 1[0m
```

and check again:

```sh
gpg --keyid-format long --verify SHA256SUMS.gpg SHA256SUMS
```

For a correct file the result should look like:

```ansi
[0;2mgpg: Signature made Mi 09 oct 2024 03:23:30 +0300 EEST[0m
[0;2mgpg:                using RSA key D2EB44626FDDC30B513D5BB71A5D6C4C7DB87C81[0m
[0;1mgpg: Good signature from "UEC Image Automatic Signing Key <cdimage@ubuntu.com>" [unknown][0m
[0;2mgpg: WARNING: This key is not certified with a trusted signature![0m
[0;2mgpg:          There is no indication that the signature belongs to the owner.[0m
[0;2mPrimary key fingerprint: D2EB 4462 6FDD C30B 513D  5BB7 1A5D 6C4C 7DB8 7C81[0m
```

The **Good signature** message means that the integrity of `SHA256SUMS`'s is verified with success but **BAD signature** means that `SHA256SUMS` or `SHA256SUMS.gpg` is incorrect.

Check the hash of the image:

```ansi
[0;92msha256sum --ignore-missing -c SHA256SUMS[0m

[0;1mnoble-server-cloudimg-amd64.img: OK[0m
```

## Next step

See the [Debian, Ubuntu and cloud-init](/blog/debian_ubuntu_cloudinit) article.
