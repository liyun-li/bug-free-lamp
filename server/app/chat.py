from flask import Blueprint, request, session
from flask_sqlalchemy import _or
from json import dumps
from app.responses import ErrorMessage
from app.models import RequestStatus, Friendship, Message
from app.utils import check_fields, get_user, get_post_data, \
    friendship_exists_between, safer_commit, commit_response, \
    get_chat

base_route = 'chat'
chat = Blueprint(base_route, __name__)


@chat.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return ErrorMessage.UNAUTHORIZED, 403


@chat.route(f'/{base_route}/get', methods=['POST'])
def get_inbox():
    # TODO: Don't get everything at once. Paginate instead.
    me = session.get('username')
    data = get_post_data()
    friend = data.get('friend')

    if not check_fields([friend]):
        return ErrorMessage.USER_NOT_FOUND, 400

    return dumps(get_chat(me, friend)), 200


@chat.route(f'/{base_route}/send', methods=['POST'])
def send_message():
    sender = session.get('username')
    data = get_post_data()

    receiver = data.get('receiver')
    timestamp = data.get('timestamp')
    message = data.get('message')

    # check that fields are not empty
    if not check_fields([receiver, timestamp, message]):
        return ErrorMessage.EMPTY_MESSAGE, 400

    # check that receiver is friend of sender
    # TODO: this approach slows down performance by a great deal
    if not friendship_exists_between(sender, receiver):
        return f'User `{receiver}` is not your friend.', 400

    try:
        timestamp = int(timestamp)
    except ValueError:
        return ErrorMessage.INVALID_TIMESTAMP, 400

    message = Message(
        sender=sender, receiver=receiver,
        message=message, timestamp=timestamp,
        read_by_sender=False, read_by_receiver=True
    )

    db.session.add(message)
    return commit_response()
