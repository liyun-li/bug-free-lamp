#!/bin/sh

# NPM magic
cd client
npm install && npm run build
cd ..
sh scripts/gen-cert.sh && mv *.pem client/build/

