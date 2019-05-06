#!/bin/sh

# First argument is your network interface

sudo sysctl net.ipv4.ip_forward=1
sudo iptables -A PREROUTING -t nat -p tcp -i ens33 --dport 80 -j DNAT --to 127.0.0.1:3000
sudo iptables -A FORWARD -p tcp -d 127.0.0.1 --dport 80 -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT
