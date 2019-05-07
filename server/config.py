from dotenv import load_dotenv
from pathlib import Path
from redis import Redis
from os import getenv, urandom
from bcrypt import hashpw

load_dotenv(verbose=True)


class Config:
    # database variables
    dbuser = getenv('DB_USER')
    dbpass = getenv('DB_PASS')
    dbhost = getenv('DB_HOST')
    dbname = getenv('DB_NAME')
    dbport = 5432

    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://'

    if getenv('DB_PORT'):
        port = int(getenv('DB_PORT'))

    SQLALCHEMY_DATABASE_URI += '{u}:{p}@{h}:{pt}/{n}'.format(
        u=dbuser, p=dbpass, h=dbhost, pt=dbport, n=dbname
    )

    DEBUG = not not getenv('DEVELOPMENT_MODE')

    DATA_KEY = getenv('DATA_KEY')
    if not DATA_KEY:
        print('DATA_KEY is required')
        exit(1)

    if len(DATA_KEY) not in [16, 24, 32]:
        print(f'DATA_KEY must be 16, 24 or 32 bytes.')
        exit(1)

    USERNAME_SALT = getenv('USERNAME_SALT')
    if not USERNAME_SALT:
        print('USERNAME_SALT is required')
        exit(1)

    USERNAME_SALT = USERNAME_SALT.encode()
    try:
        hashpw(b'test', USERNAME_SALT)
    except:
        print('Incorrect bcrypt salt.')
        exit(1)

    if DEBUG:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    elif not (dbuser and dbhost and dbname):
        print('Database configuration not provided')
        exit(1)

    SECRET_KEY = getenv('SERVER_KEY')
    if not SECRET_KEY:
        print('SECRET_KEY is required.')
        exit(1)

    # session settings
    if not getenv('REDIS_HOST') or DEBUG:
        SESSION_TYPE = 'sqlalchemy'
    else:
        SESSION_TYPE = 'redis'
        SESSION_REDIS = Redis(host=getenv('REDIS_HOST'), port=6379)

    # track DB mod
    SQLALCHEMY_TRACK_MODIFICATIONS = True

    # template autoreload
    TEMPLATES_AUTO_RELOAD = True
