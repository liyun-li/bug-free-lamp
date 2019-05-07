from flask import Blueprint, request, session
from bcrypt import hashpw, checkpw, gensalt
from json import dumps
from os import getenv
from app.models import db, User, Room
from app.constants import ErrorMessage, SessionConstant, EventConstant
from app.utils import check_fields, get_user, get_post_data, safer_commit, \
    create_room, good_request, sym_encrypt, sym_decrypt, decrypt_username


auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['POST'])
def login():
    data = get_post_data()
    username = data.get('username')
    password = data.get('password')

    if not check_fields([username, password]):
        return ErrorMessage.EMPTY_FIELDS, 400

    user = get_user(username)
    if not (user and checkpw(password.encode(), user.password.encode())):
        return ErrorMessage.INVALID_CREDENTIAL, 400

    session[SessionConstant.USERNAME] = user.username
    session[SessionConstant.USERNAME_HASH] = user.username_hash
    session[SessionConstant.UPDATE_STREAM] = sym_decrypt(
        bytes.fromhex(user.room)
    )

    decrypted_username = sym_decrypt(bytes.fromhex(user.username)).decode()

    return dumps({
        'username': decrypted_username,
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
    username_hash = hashpw(
        username.lower().encode(),
        getenv('USERNAME_SALT').encode()
    ).decode()
    password_hash = hashpw(password.encode(), gensalt()).decode()
    room_id = create_room()
    encrypted_username = sym_encrypt(username).hex()
    decrypted_username = decrypt_username(encrypted_username)

    room = Room(room_id=room_id)

    user = User(
        username_hash=username_hash,
        username=encrypted_username,
        password=password_hash,
        room=room_id
    )

    db.session.add(room)
    db.session.add(user)

    if not safer_commit():
        return ErrorMessage.REGISTRATION_ERROR, 400

    session[SessionConstant.USERNAME] = encrypted_username
    session[SessionConstant.USERNAME_HASH] = username_hash
    session[SessionConstant.UPDATE_STREAM] = sym_decrypt(
        bytes.fromhex(room_id)
    )

    return dumps({
        'username': decrypted_username
    })


@auth.route(f'/logout')
def logout():
    session.clear()
    return good_request()
