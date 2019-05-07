# Bug Free Lamp
School project woo!

## Requirements

* Node and NPM
* Python 3
* (Optional) Docker
* (Optional) Docker Compose

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
