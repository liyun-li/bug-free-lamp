#!/bin/sh

cat dn | openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem
echo
