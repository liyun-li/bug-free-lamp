from flask import request
from bcrypt import hashpw, checkpw, gensalt
from json import loads

from app.models import db, User


def safer_commit():
    try:
        db.session.commit()
        return True
    except:
        db.session.rollback()
        return False


def get_post_data():
    return loads(request.data or request.form)


def check_fields(fields):
    return False if None in fields or '' in fields else True


def get_user(username):
    return User.query.filter_by(username=username).first()


def register_user(username, password):
    user = get_user(username)
    if not user:  # now we register
        password_hash = hashpw(password.encode('utf-8'), gensalt())
        user = User(username=username, password=password_hash)
        db.session.add(user)
        return safer_commit()
    return False


def check_username_password(username, password):
    user = get_user(username)
    if not user:
        return False
    return checkpw(password.encode('utf-8'), user.password)
