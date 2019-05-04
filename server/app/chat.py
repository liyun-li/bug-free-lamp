from flask import Blueprint, request, session
from flask_socketio import emit, join_room, leave_room
from sqlalchemy import or_
from json import dumps
from time import time
from app.constants import ModelConstant, ErrorMessage, SessionConstant, \
    EventConstant
from app.models import db, RequestStatus, Friendship, Message, Room
from app.utils import check_fields, get_user, get_post_data, \
    friendship_exists_between, safer_commit, commit_response, \
    get_messages_between, get_friendship, sym_encrypt, create_room, \
    get_room, bad_request, good_request, sym_decrypt

base_route = 'chat'
chat = Blueprint(base_route, __name__)


@chat.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return ErrorMessage.UNAUTHORIZED, 403


@chat.route(f'/{base_route}/get', methods=['GET'])
def get_inbox():
    me = session.get('username')

    friends = []
    friendships = Friendship.query.filter(
        or_(Friendship.user1 == me, Friendship.user2 == me)
    ).all()

    for friendship in friendships:
        if friendship.status == RequestStatus.accepted:
            if friendship.user1 == me:
                friends.append(friendship.user2)
            elif friendship.user2 == me:
                friends.append(friendship.user1)

    return dumps(friends)


@chat.route(f'/{base_route}/get', methods=['POST'])
def get_messages():
    # TODO: Don't get everything at once. Paginate instead.
    data = get_post_data()
    friend = data.get('username')
    me = session.get('username')

    if not check_fields([friend]):
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    messages = [
        {
            'username': message.sender,
            'timestamp': message.timestamp,
            'message': message.message
        } for message in
        get_messages_between(me, friend)
    ]

    return dumps(messages), 200


@chat.route(f'/{base_route}/send', methods=['POST'])
def send_message():
    sender = session.get('username')
    data = get_post_data()

    receiver = data.get('receiver')
    message = data.get('message')

    # check that fields are not empty
    if not check_fields([receiver, message]):
        return bad_request(ErrorMessage.EMPTY_MESSAGE)

    # check that receiver is friend of sender
    # TODO: this approach slows down performance by a great deal
    if not friendship_exists_between(sender, receiver):
        return bad_request(ErrorMessage.NOT_FRIEND)

    try:
        timestamp = int(time())
    except ValueError:
        return bad_request(ErrorMessage.INVALID_TIMESTAMP)

    message = Message(
        sender=sender, receiver=receiver,
        message=message, timestamp=timestamp,
        read_by_sender=False, read_by_receiver=True
    )

    db.session.add(message)
    return commit_response()
