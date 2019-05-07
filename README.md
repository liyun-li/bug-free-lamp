# Bug Free Lamp
School project woo!

## Requirements

* Node and NPM
* Python 3
* bcrypt `pip install bcrypt` or something
* (Optional) Docker
* (Optional) Docker Compose
* (Optional) pwgen

## Deployment

Create a `.env` file under `server/` with the following values:

```
DB_HOST=<database host>
DB_USER=<database user>
DB_NAME=<database name>
DB_PORT=<database port>
DB_PASS=<database password>
SERVER_KEY=<a server key>
DATA_KEY=<a 32-byte key>
USERNAME_SALT=<a bcrypt salt>
```

Create a `.env` file under `client/` with the following values:

```
SERVER_ENDPOINT=<bug.free.lamp>
```

Then:

```
sh prepare-server.sh
sh prepare-client.sh
docker-compose up
```
