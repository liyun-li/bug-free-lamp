from flask import request, session
from sqlalchemy import and_, or_
from bcrypt import hashpw, checkpw, gensalt
from json import loads
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from secrets import token_hex
from os import getenv
from secrets import token_bytes
from app.models import db, User, Friendship, Message, RequestStatus, Room
from app.constants import ModelConstant, SessionConstant


def str2bytes(s):
    return s.encode() if type(s) == str else s


def safer_commit():
    try:
        db.session.commit()
        return True
    except Exception as e:
        print(e)
        db.session.rollback()
        return False


def commit_response(success_message='', code_success=204):
    code_success = 200 if success_message else code_success
    return (success_message, code_success) if safer_commit() \
        else ('Something went wrong :\'(', 500)


def get_post_data():
    """
    Get data from a POST request
    """

    return loads(request.data or request.form)


def check_fields(fields):
    """
    `fields` are anything
    """

    return False if None in fields or '' in fields else True


def get_user(username):
    lowercased = username.lower()
    if type(lowercased) != bytes:
        lowercased = lowercased.encode()
    userhash = hashpw(lowercased, getenv('USERNAME_SALT').encode())
    return User.query.filter_by(username_hash=userhash.decode()).first()


def get_friendship(user1, user2):
    """
    `user1` and `user2` are usernames
    """

    return Friendship.query.filter(
        or_(
            and_(Friendship.user1 == user1, Friendship.user2 == user2),
            and_(Friendship.user1 == user2, Friendship.user2 == user1)
        )
    ).first()


def friendship_exists_between(user1, user2):
    """
    `user1` and `user2` are usernames
    """

    friendship = get_friendship(user1, user2)
    return False if not friendship \
        else friendship.status == RequestStatus.accepted


def get_room(room_id):
    return Room.query.filter_by(room_id=room_id).first()


def token_gen(token_size=32):
    return token_bytes(token_size)


def sym_encrypt(plaintext, key=None):
    """
    AES encryption with GCM mode of operation.
    GCM: https://en.wikipedia.org/wiki/Galois/Counter_Mode

    :param plaintext: Plaintext
    :returns Byte stream 16-byte nonce, 16-byte tag and ciphertext
    """

    key = (key or getenv('DATA_KEY')).encode()
    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(str2bytes(plaintext))

    if len(cipher.nonce) != ModelConstant.GCM_NONCE_SIZE or \
            len(tag) != ModelConstant.GCM_TAG_SIZE:
        raise ValueError('Cipher nonce and tag are not of the correct length')

    return cipher.nonce + tag + ciphertext


def sym_decrypt(nonce_tag_ciphertext, key=None):
    """
    AES decryption with GCM mode of operation.
    Returns a byte stream

    :param nonce_tag_ciphertext: Ciphertext with nonce and tag, hexxed
    """

    nonce_size = ModelConstant.GCM_NONCE_SIZE
    tag_size = ModelConstant.GCM_TAG_SIZE

    nonce = nonce_tag_ciphertext[:nonce_size]
    tag = nonce_tag_ciphertext[nonce_size:nonce_size + tag_size]
    ciphertext = nonce_tag_ciphertext[nonce_size + tag_size:]

    key = (key or getenv('DATA_KEY')).encode()
    cipher = AES.new(key, AES.MODE_GCM, nonce)

    try:
        return cipher.decrypt_and_verify(ciphertext, tag)
    except ValueError:
        # Wrong key, wrong tag, wrong nonce, etc...
        return None


def create_room():
    """
    Returns an encrypted room ID, encrypted and hexxed
    """

    room_id = token_bytes(ModelConstant.ROOM_ID_SIZE)
    room_id = sym_encrypt(room_id).hex()
    while get_room(room_id):
        room_id = token_bytes(ModelConstant.ROOM_ID_SIZE)
        room_id = sym_encrypt(room_id).hex()

    return room_id


def get_me():
    """
    Get my username
    """
    return session.get(SessionConstant.USERNAME)


def get_my_hash():
    """
    Get my username hash
    """
    return session.get(SessionConstant.USERNAME_HASH)


def get_update_stream():
    """
    Get update stream
    """

    return session.get(SessionConstant.UPDATE_STREAM)


def bad_request(error_message, status_code=400):
    if status_code < 400:
        raise Exception('Bad requests or server errors only!')
    return error_message, status_code


def good_request(message=''):
    status_code = 200 if message else 204
    return message, status_code


def get_messages_by(username_hash):
    return Message.query.filter(
        or_(
            Message.sender == username_hash,
            Message.receiver == username_hash
        )
    ).all()


def get_messages_between(user1, user2):
    """
    Get chat by requester's username and sort it by timestamp

    :param me: Requester's username
    :param friend: Friend's username
    """

    if not friendship_exists_between(user1, user2):
        return []

    return Message.query.filter(
        or_(
            and_(
                Message.sender == user1,
                Message.receiver == user2
            ),
            and_(
                Message.receiver == user1,
                Message.sender == user2
            )
        )
    ).order_by(Message.timestamp).all()


def asym_decrypt(key, message):
    rsa_key = RSA.import_key(str2bytes(key))
    cipher = PKCS1_OAEP.new(rsa_key)
    return cipher.decrypt(str2bytes(message))


def asym_encrypt(key, message):
    rsa_key = RSA.import_key(str2bytes(key))
    cipher = PKCS1_OAEP.new(rsa_key)
    return cipher.encrypt(str2bytes(message))


def decrypt_username(username, key=None):
    return sym_decrypt(bytes.fromhex(username), key).decode()


def hash_username(username):
    if type(username) == str:
        username = username.encode()
    return hashpw(
        username.strip().lower(),
        getenv('USERNAME_SALT').encode()
    ).decode()


def get_user_by_hash(uhash):
    user = User.query.filter_by(username_hash=uhash).first()
    return user


def decrypt_room_id(room_id):
    return sym_decrypt(bytes.fromhex(room_id))
