from flask import Blueprint, request, session
from bcrypt import hashpw, checkpw, gensalt
from app.models import db, User
from app.responses import ErrorMessage
from app.utils import check_fields, get_user, get_post_data, safer_commit


auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['POST'])
def login():
    data = get_post_data()
    username = data.get('username')
    password = data.get('password')

    if not check_fields([username, password]):
        return ErrorMessage.EMPTY_FIELDS, 400

    user = get_user(username)
    if not (user and checkpw(password.encode('utf-8'), user.password)):
        return ErrorMessage.INVALID_CREDENTIAL, 400

    session['username'] = username

    return '', 204


@auth.route('/register', methods=['POST'])
def register():
    data = get_post_data()
    username = data.get('username')
    password = data.get('password')

    if not check_fields([username, password]):
        return ErrorMessage.EMPTY_FIELDS, 400

    user = get_user(username)

    if user:
        return ErrorMessage.USERNAME_ALREADY_EXISTS, 400

    # now we register
    password_hash = hashpw(password.encode('utf-8'), gensalt())
    user = User(username=username, password=password_hash)
    db.session.add(user)

    if not safer_commit():
        return ErrorMessage.REGISTRATION_ERROR, 400

    session['username'] = username

    return '', 204
