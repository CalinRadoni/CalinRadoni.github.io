---
title: "Port mirroring"
description: "Some simple port mirroring examples"
# categories: [ "Networking" ]
pubDate: 2021-04-06
tags: [ "Port mirroring" ]
---

Port mirroring examples:

## Allied Telesys

Mirror the traffic from port 9 to port 2:

```plaintext
interface port1.0.2
  mirror interface port1.0.9 direction both
  switchport
```

## Cisco

Mirror the traffic from ports 4, 5, 6 and 8 to port 3, member of VLAN 4001

```plaintext
interface FastEthernet0/3
  switchport access vlan 4001
  switchport mode access

monitor session 1 source interface Fa0/4 - 6 , Fa0/8
monitor session 1 destination interface Fa0/3
```

## Huawei

Mirror the traffic from port 23 to port 24, member of VLAN 4001

```plaintext
interface GigabitEthernet0/0/24
  port link-type access
  port default vlan 4001

observe-port 1 interface GigabitEthernet0/0/24

interface GigabitEthernet0/0/23
  ... port configuration here ...
  port-mirroring to observe-port 1 inbound
  port-mirroring to observe-port 1 outbound
```
