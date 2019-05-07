#!/bin/sh

cn=$1
if [ -z $cn ]; then
	cn='bug.free.lamp'
fi

openssl req -x509 -nodes -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 \
	-subj "/C=US/ST=NY/L=Brooklyn/O=New York University/OU=Tandon School of Engineering/CN=$cn"
