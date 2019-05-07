#!/bin/sh

# back up just because
cp -n docker-compose.yml docker-compose.yml.bak

BFL_DIR="server"

DB_NAME="bug_free_lamp"
DB_HOST="alice"
DB_USER="alice"
DB_PASS="`sh scripts/pwgen.sh`"
SERVER_KEY="`sh scripts/pwgen.sh`"
DATA_KEY="`sh scripts/pwgen.sh 4`"
USERNAME_SALT="'"`python3 -c 'import bcrypt; print(bcrypt.gensalt().decode())'`"'"


env_path="server/.env"
echo 'DB_NAME='$DB_NAME > $env_path
echo 'DB_HOST='$DB_HOST >> $env_path
echo 'DB_USER='$DB_USER >> $env_path
echo 'DB_PASS='$DB_PASS >> $env_path
echo 'REDIS_HOST=bob' >> $env_path
echo 'SERVER_KEY='$SERVER_KEY >> $env_path
echo 'DATA_KEY='$DATA_KEY >> $env_path
echo 'USERNAME_SALT='$USERNAME_SALT >> $env_path

# parse .env file
bfl_name=`cat $BFL_DIR/.env | grep DB_NAME | cut -d '=' -f2`
bfl_user=`cat $BFL_DIR/.env | grep DB_USER | cut -d '=' -f2`
bfl_password=`cat $BFL_DIR/.env | grep DB_PASS | cut -d '=' -f2`

# replacement
sed -i "s/<BFL_DB_NAME_HERE>/$bfl_name/g" docker-compose.yml
sed -i "s/<BFL_DB_USER_HERE>/$bfl_user/g" docker-compose.yml
sed -i "s/<BFL_DB_PASSWORD_HERE>/$bfl_password/g" docker-compose.yml

sh scripts/gen-cert.sh && mv *.pem server/
