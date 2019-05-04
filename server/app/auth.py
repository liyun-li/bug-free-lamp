from flask import Blueprint, request, session
from bcrypt import hashpw, checkpw, gensalt
from json import dumps
from app.models import db, User
from app.constants import ErrorMessage, SessionConstant, EventConstant
from app.utils import check_fields, get_user, get_post_data, safer_commit, \
    create_room, good_request


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

    session[SessionConstant.USERNAME] = user.username
    session[SessionConstant.UPDATE_STREAM] = user.room

    return dumps({
        'username': user.username,
        'publicKey': user.public_key,
        'mood': user.mood,
        'status': user.status
    })


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
    password_hash = hashpw(password.encode(), gensalt())
    room = create_room()

    user = User(
        system_username=username.lower(),
        username=username,
        password=password_hash,
        room=room
    )

    db.session.add(user)

    if not safer_commit():
        return ErrorMessage.REGISTRATION_ERROR, 400

    session[SessionConstant.USERNAME] = username
    session[SessionConstant.UPDATE_STREAM] = room

    return dumps({
        'username': user.username
    })


@auth.route(f'/logout')
def logout():
    session.clear()
    return good_request()
