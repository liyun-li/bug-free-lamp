from dotenv import load_dotenv
from pathlib import Path
from redis import Redis
from os import getenv, urandom

load_dotenv(verbose=True)

DEV_MODE = getenv('DEVELOPMENT_MODE')


class Config:
    # database variables
    dbuser = getenv('DB_USER')
    dbpass = getenv('DB_PASS')
    dbhost = getenv('DB_HOST')
    dbname = getenv('DB_NAME')
    dbport = 3306

    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://'

    if getenv('DB_PORT'):
        port = int(getenv('DB_PORT'))

    SQLALCHEMY_DATABASE_URI += '{u}:{p}@{h}:{pt}/{n}'.format(
        u=dbuser, p=dbpass, h=dbhost, pt=dbport, n=dbname
    )

    DEBUG = False

    if DEV_MODE:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
        DEBUG = True
    elif not (dbuser and dbhost and dbname):
        print('Database configuration not provided')
        exit(1)

    # Caching settings
    if DEV_MODE:
        SESSION_TYPE = 'sqlalchemy'
        SECRET_KEY = urandom(64)
    else:
        SESSION_TYPE = 'redis'
        SESSION_FILE_DIR = Redis(host='app_cache', port=6379)
        SECRET_KEY = getenv('SERVER_KEY')

    if not SECRET_KEY:
        print('A secret key is required.')
        exit(1)

    # track DB mod
    SQLALCHEMY_TRACK_MODIFICATIONS = True

    # template autoreload
    TEMPLATES_AUTO_RELOAD = True
