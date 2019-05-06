from flask import Blueprint, request, session
from flask_socketio import emit
from sqlalchemy import or_, and_
from json import dumps
from time import time
from app.constants import ModelConstant, ErrorMessage, SessionConstant, \
    EventConstant
from app.models import db, RequestStatus, Friendship, Message, Room
from app.utils import check_fields, get_user, get_post_data, \
    friendship_exists_between, safer_commit, commit_response, \
    get_messages_between, get_friendship, sym_encrypt, create_room, \
    get_room, bad_request, sym_decrypt, get_user_by_hash, get_me, \
    hash_username, decrypt_username
from app.events import emit_update

base_route = 'chat'
chat = Blueprint(base_route, __name__)


@chat.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return ErrorMessage.UNAUTHORIZED, 403


@chat.route(f'/{base_route}/get', methods=['GET'])
def get_inbox():
    print(decrypt_username(get_me()))
    me = hash_username(decrypt_username(get_me()))
    print()
    print()
    print()
    print(me)

    test = Friendship.query.all()
    for t in test:
        print(t.user1, t.user2)
    print()
    print()
    print()

    friends = []
    friendships = Friendship.query.filter(
        and_(
            or_(Friendship.user1 == me, Friendship.user2 == me),
            Friendship.status == RequestStatus.accepted
        )
    ).all()

    print(friendships)

    for friendship in friendships:
        friend = get_user_by_hash(
            friendship.user1 if friendship.user2 == me
            else friendship.user2
        )

        if not friend:
            continue

        friends.append({
            'username': sym_decrypt(user.username),
            'publicKey': friend.public_key,
            'mood': friend.mood,
            'status': friend.status
        })

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

    friendship = get_friendship(sender, receiver)
    if not friendship:
        return bad_request(ErrorMessage.NOT_FRIEND)

    try:
        timestamp = int(time())
    except ValueError:
        return bad_request(ErrorMessage.INVALID_TIMESTAMP)

    message_model = Message(
        sender=sender, receiver=receiver,
        message=message, timestamp=timestamp,
        read_by_receiver=True
    )

    db.session.add(message_model)
    response = commit_response()

    if response[1] < 300:
        room_id = sym_decrypt(bytes.fromhex(friendship.room))
        if not room_id:
            return bad_request(ErrorMessage.BREACHED)

        emit(
            EventConstant.EVENT_GET_NEW_MESSAGE,
            {
                'timestamp': timestamp,
                'username': sender,
                'message': message
            },
            room=room_id,
            namespace=EventConstant.NS_CHAT,
            callback=lambda x: print(message, sender)
        )

    return response
