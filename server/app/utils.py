from flask import request
from sqlalchemy import and_, or_
from bcrypt import hashpw, checkpw, gensalt
from json import loads
from app.models import db, User, Friendship, Message, RequestStatus
from Crypto.Cipher import AES
from secrets import token_hex
from os import getenv
from secrets import token_bytes


def safer_commit():
    try:
        db.session.commit()
        return True
    except:
        db.session.rollback()
        return False


def commit_response(success_message='', code_success=204):
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
    return User.query.filter_by(username=username).first()


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


def get_chat(me, friend):
    """
    Get chat by requester's username
    and sort it by timestamp

    `me`: Requester's username
    `friend`: Friend's username
    """

    if not friendship_exists_between(me, friend):
        return []

    else:
        return Message.query.filter(
            or_(
                and_(Message.sender == me, Message.receiver == friend),
                and_(Message.sender == friend, Message.receiver == me)
            )
        ).order_by(Message.timestamp).all()


def get_room(room_id):
    return Room.query.filter_by(room_id=room_id).first()


def token_gen(token_size=32):
    return token_bytes(token_size)


def sym_encrypt(plaintext, key=None):
    """
    AES encryption with GCM mode of operation.
    GCM: https://en.wikipedia.org/wiki/Galois/Counter_Mode

    @param plaintext Plaintext
    @returns A 16-byte nonce, a 16-byte authentication tag and the ciphertext
    """

    key = (key or getenv('DATA_KEY')).encode()
    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    return {
        'ciphertext': ciphertext,
        'nonce': cipher.nonce,
        'tag': tag
    }


def sym_decrypt(tag, ciphertext, nonce=None, key=None):
    """
    AES decryption with GCM mode of operation.
    GCM: https://en.wikipedia.org/wiki/Galois/Counter_Mode

    @param nonce One-time use random value
    @param tag Authentication tag used to verify data integrity
    @param ciphertext Ciphertext
    @returns The plaintext
    """

    key = (key or getenv('DATA_KEY')).encode()
    if nonce:
        cipher = AES.new(key, AES.MODE_GCM, nonce)
    else:
        cipher = AES.new(key, AES.MODE_GCM)
    return cipher.decrypt_and_verify(ciphertext, tag)
