#!/bin/sh

# First argument is your network interface

sudo sysctl net.ipv4.ip_forward=1
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 127.0.0.1:3001
sudo iptables -A FORWARD -p tcp -d bug.free.lamp --dport 80 -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT
