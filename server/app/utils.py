from flask import request
from sqlalchemy import and_, or_
from bcrypt import hashpw, checkpw, gensalt
from json import loads
from app.models import db, User, Friendship, RequestStatus


def safer_commit():
    try:
        db.session.commit()
        return True
    except:
        db.session.rollback()
        return False


def commit_response(success_message=''):
    return f'{success_message}', 204 if safer_commit() \
        else 'Something went wrong :\'(', 500


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
            (Message.sender == me & Message.receiver == friend) |
            (Message.sender == friend & Message.receiver == me)
        ).order_by(Message.timestamp).all()
