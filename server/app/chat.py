from flask import Blueprint, request, session
from sqlalchemy import or_
from json import dumps
from app.responses import ErrorMessage, bad_request
from app.models import RequestStatus, Friendship, Message
from app.utils import check_fields, get_user, get_post_data, \
    friendship_exists_between, safer_commit, commit_response, get_chat

base_route = 'chat'
chat = Blueprint(base_route, __name__)


@chat.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return ErrorMessage.UNAUTHORIZED, 403


@chat.route(f'/{base_route}/join', methods=['POST'])
def join_chat():
    data = get_post_data()
    me = session.get('username')

    friend = session.get('friend')
    if not check_fields([friend]):
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    if not friendship_exists_between(me, friend):
        return bad_request(ErrorMessage.NOT_FRIEND)

    return commit_response()


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
    me = session.get('username')
    data = get_post_data()
    friend = data.get('friend')

    if not check_fields([friend]):
        return bad_request(ErrorMessage.USER_NOT_FOUND)

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
        return bad_request(ErrorMessage.EMPTY_MESSAGE)

    # check that receiver is friend of sender
    # TODO: this approach slows down performance by a great deal
    if not friendship_exists_between(sender, receiver):
        return bad_request(ErrorMessage.NOT_FRIEND)

    try:
        timestamp = int(timestamp)
    except ValueError:
        return bad_request(ErrorMessage.INVALID_TIMESTAMP)

    message = Message(
        sender=sender, receiver=receiver,
        message=message, timestamp=timestamp,
        read_by_sender=False, read_by_receiver=True
    )

    db.session.add(message)
    return commit_response()
