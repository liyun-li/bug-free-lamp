from node:12.1.0-stretch-slim
maintainer None <nobody@dont-contact.us>

copy . /opt/client
workdir /opt/client
run npm install
run npm run build
run npm install -g serve
workdir /opt/client/build

cmd HOST=0.0.0.0 PORT=3000 serve
