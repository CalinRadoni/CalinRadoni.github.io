---
title: "Debian, Ubuntu and cloud-init"
description: "About Debian and Ubuntu cloud images and cloud-init."
pubDate: 2024-11-05
# updatedDate: 2024-11-05
tags: [ "cloud-init", "Cloud Images", "Debian", "Ubuntu", "LXD", "VHDX", "Hyper-V" ]
---

- [Cloud images](#cloud-images)
- [Cloud-init configuration](#cloud-init-configuration)
- [Deployment](#deployment)
- [Resize the image](#resize-the-image)
- [Test the cloud-init configuration](#test-the-cloud-init-configuration)
  - [Test with LXC virtual machine](#test-with-lxc-virtual-machine)
  - [Test with LXC container](#test-with-lxc-container)
  - [Test with QEMU](#test-with-qemu)
- [Create VHDX image](#create-vhdx-image)

## Cloud images

### Debian

Download the image that you want form the official [Debian images](https://cloud.debian.org/images/) site. Do not forget the file with the hashes. Example:

```sh
# download the QCow2 image
wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-generic-amd64.qcow2
# or the raw image
wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-generic-amd64.tar.xz
# and the file with hashes
wget https://cloud.debian.org/images/cloud/bookworm/latest/SHA512SUMS

# (optional) make the source images read only
chmod 400 debian-12-generic-amd64.qcow2
chmod 400 debian-12-generic-amd64.tar.xz

# check the hash of downloaded image(s):
sha512sum --check --ignore-missing SHA512SUMS
```

**Note:** There is no signature file to verify the integrity of `SHA512SUMS`:
> For the current official images (in the per-distribution directories), the safest method is to download the image and checksum files over TLS from cloud.debian.org or cdimage.debian.org. These names support DNSSEC, so a validating resolver can ensure that a client is connected to a Debian host. And TLS ensures that the data is not manipulated in flight.

### Ubuntu

To select, download and verify Ubuntu cloud images see the [Ubuntu Cloud Images](/blog/ubuntu_cloud_images) article.

## Cloud-init configuration

You need at least two files, `user-data` and `meta-data`. `meta-data` can be empty and `user-data` can be as simple as:

```yaml
#cloud-config
password: password
chpasswd:
  expire: False
```

which sets the password for the default `debian` user to `password` when used with a Debian cloud image (*tested with `debian-12-generic-amd64`*).

A more useful configuration is in the next script that creates:

- a `user-data` file that:
  - set the hostname, locale and keyboard layout;
  - skip the creation of default user - the existence of the `users:` key does this;
  - create a user with elevated privileges and add a ssh key for it. **Change** the `name` and `ssh-ed25519 AAAA...` as you want;
  - customize the `/etc/issue` to show the IPv4 address - `man getty` for more information.
- an empty `meta-data` if none existed;
- an `iso` that can be used to pass configured settings to a cloud image.

```sh
#!/bin/bash

cat > user-data << 'EOF'
#cloud-config

hostname: cloud-image
manage_etc_hosts: True
keyboard:
  layout: us
locale: en_US.UTF-8

users:
  - name: calin
    groups: sudo
    gecos: System Administrator
    lock_passwd: True
    shell: /bin/bash
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - 'ssh-ed25519 AAAA...'

write_files:
  - path: /etc/issue
    content: |
      \e{lightcyan}\S \e{gray}\n \e{lightgreen}\4 \e{reset}\l
EOF

[[ -f meta-data ]] || touch meta-data

if ! command -v cloud-localds >/dev/null 2>&1; then
  sudo apt update && \
    sudo apt -y install cloud-image-utils
fi
cloud-localds seed.iso user-data meta-data
```

For more information about `cloud-init`, its modules and examples, see the [cloud-init documentation](https://cloudinit.readthedocs.io/en/stable/index.html) and keep a link to [cloud-init Reference](https://cloudinit.readthedocs.io/en/stable/reference/index.html) close.

## Deployment

This previous script creates an `iso` file for distribution of `cloud-init` configuration but there are other ways. See the:

- [NoCloud](https://cloudinit.readthedocs.io/en/stable/reference/datasources/nocloud.html) datasource for local deployment, when you do not use a cloud;
- [Datasources](https://cloudinit.readthedocs.io/en/stable/reference/datasources.html) document for a specific cloud.

## Resize the image

The cloud images are small. Before deployment to production you may want to resize them:

```sh
chmod 600 image_file_name.qcow2
qemu-img resize -f qcow2 image_file_name.qcow2 32G
```

At the **first boot**, the cloud images (I tested only Debian 12 and Ubuntu 24) will automatically resize the `root` partition and the `root file system` to fill available space so you don't have to.

**Note:** with `qemu-img resize` you may skip format specification for `qcow2` but is mandatory for `raw` images.

## Test the cloud-init configuration

I use [QEMU](https://www.qemu.org/) and [LXD](https://ubuntu.com/lxd) to test `cloud-init` configurations before deployment. For `LXD` and `QEMU`, read on, but, for more information, read [How to run cloud-init locally](https://cloudinit.readthedocs.io/en/stable/howto/run_cloud_init_locally.html)

### Test with LXC virtual machine

A LXC virtual machine can use a `raw` disk. Extract the compressed image, rename the raw disk and make it as read-only:

```sh
tar -xf debian-12-generic-amd64.tar.xz
mv disk.raw debian-12-generic-amd64.raw
chmod 400 debian-12-generic-amd64.raw
```

Assuming `user-data` is the `cloud-init` configuration file, use this script to create a VM and start it:

```sh
# make a copy of the source cloud image
[[ -f d12test.raw ]] && rm -f d12test.raw
cp debian-12-generic-amd64.raw d12test.raw
# the disk image should be writable by the user
chmod 600 d12test.raw

# create an empty VM
lxc init d12test --vm --empty
# add d12test.raw as main disk with high boot priority
lxc config device add d12test disk_media disk source="$(pwd)/d12test.raw" boot.priority=9
# add a second disk for cloud-init configuration
lxc config device add d12test config_media disk source=cloud-init:config boot.priority=0
# load `cloud-init.user-data` from the file `user-data`
lxc config set d12test cloud-init.user-data - < user-data
# start the VM
lxc start d12test --console=vga
```

You can connect with SSH to the newly created and configured virtual machine.

If `/etc/issue` is customized by `cloud-init`, like presented in the [Cloud-init configuration](#cloud-init-configuration) chapter, you should see the IPv4 address of the newly created virtual machine.

### Test with LXC container

```sh
lxc launch ubuntu:noble ubuntu-noble-test --config=user.user-data="$(cat user-data)"
```

Connect to the container with:

```sh
lxc exec ubuntu-noble-test /bin/bash
```

or use `lxc list` to see the IP address of `ubuntu-noble-test` container and connect to it with SSH.

### Test with QEMU

```sh
# make a copy of the source cloud image
cp debian-12-generic-amd64.qcow2 d12test.qcow2
# the disk image should be writable by the user
chmod 600 d12test.qcow2

# create a VM and forward guest SSH server to the host's port 2222
qemu-system-x86_64 -m 2048 -net nic -net user,hostfwd=tcp::2222-:22 \
    -drive file=d12test.qcow2,index=0,format=qcow2,media=disk \
    -drive file=seed.iso,index=1,media=cdrom \
    -machine accel=kvm:tcg
```

Now you should be able to connect with SSH to the new virtual machine. Here is an example SSH config:

```ssh-config
Host d12test
    HostName localhost
    Port 2222
    User calin
    IdentityFile ___full_path_to_private_key___
    IdentitiesOnly yes
```

## Usage on Hyper-V

### Create VHDX image

This script:

- downloads a compressed `raw` image and the hashes;
- checks the hash of downloaded file;
- resizes the `raw` image to `32G`;
- creates a dynamic VHDX image with the block size set to 1M as in [Best Practices for running Linux on Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v).

```sh
#!/bin/bash

wget https://cloud.debian.org/images/cloud/bookworm/latest/SHA512SUMS
wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-generic-amd64.tar.xz
sha512sum --check --ignore-missing SHA512SUMS

tar -xf debian-12-generic-amd64.tar.xz

qemu-img resize -f raw disk.raw 32G

qemu-img convert -f raw -O vhdx -o subformat=dynamic,block_size=1M disk.raw debian-12-generic-amd64.vhdx
qemu-img info debian-12-generic-amd64.vhdx

rm disk.raw
```

### The virtual machine

In `Hyper-V` create a virtual machine with:

- secure boot `Enabled` with the `Microsoft UEFI Certificate Authority` template
- a copy of `debian-12-generic-amd64.vhdx` as hard drive
- `seed.iso` as DVD image

When you start the virtual machine with `/etc/issue` customized by `cloud-init` you should see the IPv4 address of the newly started virtual machine.
