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
