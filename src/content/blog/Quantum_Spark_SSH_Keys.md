---
title: "Quantum Spark SMB SSH access with Public Key"
description: "Configure access to Quantum Spark SMB appliances with R81.10.xx using SSH and public key authentication"
# categories: [ "Networking" ]
pubDate: 2023-09-13
tags: [ "CheckPoint", "SSH", "public key", "Quantum Spark", "ed25519", "ssh-keygen" ]
---

This procedure and the troubleshooting steps were tested on Quantum Spark 1500 R81.10.xx and was adapted to be compatible with [sk179986](https://support.checkpoint.com/results/sk/sk179986) - not available anymore.

**Warning:** This configuration does not survive a firmware upgrade.

## The Procedure

Create a `ed25519` key pair and save the keys to `ckpSMBAccessKey` and `ckpSMBAccessKey.pub` files:

```sh
ssh-keygen -t ed25519 -f ~/ckpSMBAccessKey -C ""
```

I have tested with success the following script:

- locally, on appliance, in a `bash` shell
- remote, from `SmartProvisioning`

```sh
# replace this with the ed25519 key from ckpSMBAccessKey.pub file !
pubkey='AAAA............'

# set the authorized key for SSH access
mkdir -p /storage/.ssh
chmod 700 /storage/.ssh
cat << EOF > /storage/.ssh/authorized_keys
ssh-ed25519 $pubkey
EOF
chmod 600 /storage/.ssh/authorized_keys

# change sshd's configuration to read the new key file
sed -i 's/\(AuthorizedKeysFile\).*/\1 \/storage\/\.ssh\/authorized_keys/g' /pfrm2.0/etc/sshd_config

# fix/change permissions for root directory before sshd starts
sed -i '/^cpwd_admin.*/i chown root:root \/\n' /pfrm2.0/bin/sshd.sh

# reboot is needed according to sk179986 but a service restart is enough
ps -ef | awk '/[s]shd/ {print $2}' | xargs kill -9
```

test the new configuration with:

```sh
ssh -i ~/ckpSMBAccessKey admin@ip_address_of_SMB_appliance
```

## Troubleshooting

Log to appliance and change in `/pfrm2.0/etc/sshd_config`:

```shell
#SyslogFacility AUTH
#LogLevel INFO
```

to:

```shell
#SyslogFacility AUTH
LogLevel DEBUG
```

then restart only the sshd service:

```sh
ps -ef | awk '/[s]shd/ {print $2}' | xargs kill -9
```

Reconnect with:

```sh
ssh -i your_private_key_file_name -vvv admin@ip_address_of_appliance
```

and, to see the log entries generated by `sshd`, execute from expert mode:

```sh
cat /var/log/messages | grep sshd
```

When done, set the `LogLevel` back to `INFO` and restart `sshd`.
