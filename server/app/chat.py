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
    hash_username, decrypt_username, get_my_hash
from app.events import emit_update

base_route = 'chat'
chat = Blueprint(base_route, __name__)


@chat.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return ErrorMessage.UNAUTHORIZED, 403


@chat.route(f'/{base_route}/get', methods=['GET'])
def get_inbox():
    me = get_my_hash()

    friends = []
    friendships = Friendship.query.filter(
        and_(
            or_(Friendship.user1 == me, Friendship.user2 == me),
            Friendship.status == RequestStatus.accepted
        )
    ).all()

    for friendship in friendships:
        friend = get_user_by_hash(
            friendship.user1 if friendship.user2 == me
            else friendship.user2
        )

        if not friend:
            continue

        friends.append({
            'username': decrypt_username(friend.username),
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
    me = get_my_hash()

    if not check_fields([friend]):
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    friend = hash_username(friend)

    messages = [
        {
            'sender': decrypt_username(
                get_user_by_hash(message.sender).username
            ),
            'timestamp': message.timestamp,
            'messageForSender': message.message_for_sender,
            'messageForReceiver': message.message_for_receiver
        } for message in
        get_messages_between(me, friend)
    ]

    return dumps(messages), 200


@chat.route(f'/{base_route}/send', methods=['POST'])
def send_message():
    sender = hash_username(decrypt_username(get_me()))
    data = get_post_data()

    receiver = data.get('receiver')
    message_for_receiver = data.get('messageForReceiver')
    message_for_sender = data.get('messageForSender')

    # check that fields are not empty
    if not check_fields([receiver, message_for_receiver, message_for_sender]):
        return bad_request(ErrorMessage.EMPTY_MESSAGE)

    receiver = hash_username(receiver)

    friendship = get_friendship(sender, receiver)
    if not friendship:
        return bad_request(ErrorMessage.NOT_FRIEND)

    try:
        timestamp = int(time())
    except ValueError:
        return bad_request(ErrorMessage.INVALID_TIMESTAMP)

    message = Message(
        sender=sender, receiver=receiver, timestamp=timestamp,
        message_for_receiver=message_for_receiver,
        message_for_sender=message_for_sender,
        read_by_receiver=True
    )

    db.session.add(message)
    response = commit_response()

    if response[1] < 300:
        room_id = sym_decrypt(bytes.fromhex(friendship.room)).hex()
        if not room_id:
            return bad_request(ErrorMessage.BREACHED)

        sender_username = decrypt_username(get_user_by_hash(sender).username)

        emit(
            EventConstant.EVENT_GET_NEW_MESSAGE,
            {
                'timestamp': timestamp,
                'sender': sender_username,
                'messageForSender': message_for_sender,
                'messageForReceiver': message_for_receiver
            },
            room=room_id,
            namespace=EventConstant.NS_CHAT,
            callback=lambda x: print('asdf')
        )

    return response
