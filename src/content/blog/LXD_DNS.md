---
title: "Access LXC containers by name"
description: "Access LXC containers by name, even those with static IP addresses, and also from the LXD host"
updatedDate: 2023-12-09
# categories: [ "System Administration" ]
pubDate: 2023-12-09
tags: [ "LXD", "LXC", "DNS", "resolved" ]
---

By default, for every managed network bridge, LXD sets `dnsmasq` as DNS and DHCP server. The containers with addresses assigned by `dnsmasq` can access each other by name using the default domain name `lxd`.

To access the LXC containers from a host running `systemd-resolved`, the `resolved` service must be configured.
The configuration is not persistent between reboots and restarts of LXD but can be made persistent. A relevant link is at the end of this document.

## Settings for network bridge

For a bridge network the domain advertised to DHCP client and used for DNS resolution is, by default, `lxd`.

If you create a new network the domain can be specified by using the `dns.domain` configuration option. Here is an example:

```sh
lxc network create testDNSnet --type=bridge \
    ipv4.address='10.11.12.1/24' \
    ipv4.dhcp.ranges='10.11.12.64-10.11.12.127' \
    ipv4.nat=true \
    ipv6.address=none \
    dns.domain='abc'
```

For an existing network the domain can be set using:

```sh
lxc network set testDNSnet dns.domain='abc'
```

## Configuration for resolved service

```sh
sudo resolvectl dns testDNSnet 10.11.12.1
sudo resolvectl domain testDNSnet '~abc'
```

**Note:**`~` in front of the domain name informs the `resolved` service to redirect the queries for that domain only to the specified DNS server.

## Profile for containers

This profile attaches the container's `eth0` network card to the `testDNS` network bridge.

```sh
lxc profile create testDNS
lxc profile device add testDNS eth0 nic \
    name=eth0 nictype=bridged \
    parent=testDNSnet
```

## Containers with dynamic IP addresses

Launch a container with IP addresse assigned by DHCP:

```sh
lxc launch ubuntu-minimal:22.04 testD \
    --profile default --profile testDNS
```

## Containers with static IP addresses

```sh
# create a profile with a static IP configuration
lxc profile create ip7
cat << EOF | lxc profile set ip7 cloud-init.network-config -
version: 1
config:
  - type: physical
    name: eth0
    subnets:
      - type: static
        ipv4: true
        address: 10.11.12.7
        netmask: 255.255.255.0
        gateway: 10.11.12.1
        control: auto
  - type: nameserver
    address: 10.11.12.1
EOF

# add the host record to dnsmasq
lxc network set testDNSnet raw.dnsmasq \
    host-record=testS.abc,10.11.12.7

# launch a container with previously created profile
lxc launch ubuntu-minimal:22.04 testS \
    --profile default --profile testDNS --profile ip7
```

## Test

```sh
host testD.abc
host testS.abc
lxc exec testD -- resolvectl query testS.abc
lxc exec testS -- resolvectl query testD.abc
```

## Cleanup

```sh
lxc delete testD --force
lxc delete testS --force
lxc profile delete ip7
lxc profile delete testDNS
lxc network delete testDNSnet
```

The configuration of `resolved` service is automatically deleted when the bridge network is deleted.

## Persistency

To make the notification persistent see `Make the resolved configuration persistent` in [How to integrate with systemd-resolved](https://documentation.ubuntu.com/lxd/en/latest/howto/network_bridge_resolved/)
