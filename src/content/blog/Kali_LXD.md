---
title: "Install Kali Desktop in LXD"
description: "Install Kali Desktop as a virtual machine in LXD"
updatedDate: 2023-12-20
# categories: [ "System Administration" ]
pubDate: 2023-12-15
tags: [ "LXD", "Kali", "Linux Desktop" ]
---

Any Linux distribution can be installed as a virtual machine with a desktop environment in LXD. This article focuses on Kali.

## Get and verify the ISO

Go to the official [Get Kali](https://www.kali.org/get-kali/) then from `Installer Images` download the 64-bit Installer image.

### Verify the image

From the [Kali Linux Download Server](http://cdimage.kali.org/) download the appropriate `SHA256SUMS` and `SHA256SUMS.gpg` files.

Run the next commands **and** after `gpg --verify ...` make sure that:

- it returned `Good signature`
- the `Primary key fingerprint` is the same as the fingerprint returned by `gpg --fingerprint ...`

```sh
# download and import the Kali Linux official key
wget -q -O - https://archive.kali.org/archive-key.asc | gpg --import
# gpg: key ED444FF07D8D0BF6: public key "Kali Linux Repository <devel@kali.org>" [...]

# verify that the key is properly installed
gpg --fingerprint 44C6513A8E4FB3D30875F758ED444FF07D8D0BF6
# pub   rsa4096 2012-03-05 [SC] [expires: 2025-01-24]
#       44C6 513A 8E4F B3D3 0875  F758 ED44 4FF0 7D8D 0BF6
# uid           [ unknown] Kali Linux Repository <devel@kali.org>
# sub   rsa4096 2012-03-05 [E] [expires: 2025-01-24]

# verify the signature
gpg --verify SHA256SUMS.gpg SHA256SUMS
# gpg: Signature made Lu 04 dec 2023 17:40:57 +0200 EET
# gpg:                using RSA key 44C6513A8E4FB3D30875F758ED444FF07D8D0BF6
# gpg: Good signature from "Kali Linux Repository <devel@kali.org>" [unknown]
# gpg: WARNING: This key is not certified with a trusted signature!
# gpg:          There is no indication that the signature belongs to the owner.
# Primary key fingerprint: 44C6 513A 8E4F B3D3 0875  F758 ED44 4FF0 7D8D 0BF6

# verify the SHA256 checksum for the downloaded ISO
sha256sum --check --ignore-missing SHA256SUMS
# kali-linux-2023.4-installer-amd64.iso: OK
```

If you've got `kali-linux-2023.4-installer-amd64.iso: OK` then the image is successfully authenticated and can be used *safely*.

## Create a dedicated LXC profile

According to the official [Installing Kali Linux](https://www.kali.org/docs/installation/hard-disk-install/) doc: *The Kali Linux kernel is not signed and will not be recognized by Secure Boot.*
That means we need a profile with `Secure Boot` disabled.

Also, the default disk size is too small for Kali Desktop (see [Kali Installation Sizes](https://www.kali.org/docs/installation/installation-sizes/)) so I am using a larger disk.

```sh
lxc profile create KaliDesktop

lxc profile set KaliDesktop limits.cpu=4
lxc profile set KaliDesktop limits.memory=8GiB
lxc profile set KaliDesktop security.secureboot=false

lxc profile device add KaliDesktop root disk \
    path=/ pool=default size=32GiB

lxc profile device add KaliDesktop eth0 nic \
    name=eth0 network=lxdbr0

# if you want audio
lxc profile set KaliDesktop raw.qemu='-device intel-hda -device hda-duplex -audio spice'
```

## Install Kali Desktop

```sh
lxc init kali --vm --empty --profile=KaliDesktop

lxc config device add kali \
    install_media disk source=/absolute_path_to_kali_iso \
    boot.priority=9

lxc start kali --console=vga
```

To reconnect to vm's console use:

```sh
lxc console kali --type=vga
```

After Kali is installed disconnect the install disk:

```sh
lxc config device remove kali install_media
```

For enhanced user experience, including shared clipboard support, on the guest install and enable `spice-vdagent` with:

```sh
sudo apt install -y spice-vdagent
sudo systemctl enable spice-vdagent
```

The shared clipboard will be active only after you reset the guest.

## Quick start settings

The `SSH` server can be enabled and started with:

```sh
sudo systemctl start ssh.service
sudo systemctl enable ssh.service
```

For GVM, Metasploit and system updates see the post [Virtualized Kali Linux](/blog/virtual_kali).

## Links

Mostly based on my previous articles and the official documentation:

- [Install Windows 11 in LXD](/blog/windows11_in_lxd)
- [Linux Desktop images in LXD](/blog/linuxdesktop_in_lxd)
- [Virtualized Kali Linux](/blog/virtual_kali)
