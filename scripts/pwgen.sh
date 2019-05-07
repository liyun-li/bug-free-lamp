#!/usr/bin/env sh

passwd=''
n=$1

if [ -z $n ]; then
	n=6
fi

for i in `seq 1 $n`; do
	passwd=$passwd`pwgen -s`
done

echo $passwd
