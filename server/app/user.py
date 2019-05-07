from flask import Blueprint, request, session
from flask_socketio import emit
from json import dumps
from bcrypt import hashpw
from os import getenv
from app.models import db, RequestStatus, Friendship, Room
from app.constants import ModelConstant, SessionConstant, ErrorMessage, \
    EventConstant
from app.utils import check_fields, get_user, safer_commit, get_friendship, \
    commit_response, get_post_data, sym_encrypt, create_room, \
    bad_request, good_request, get_me, asym_decrypt, sym_decrypt, \
    decrypt_username, decrypt_username, hash_username, get_user_by_hash, \
    get_my_hash, decrypt_room_id, get_messages_by
from app.events import emit_update

base_route = 'user'
user = Blueprint(base_route, __name__)


@user.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return bad_request(ErrorMessage.UNAUTHORIZED, 403)


@user.route(f'/{base_route}/hi')
def hi():
    decrypted = decrypt_username(get_me())
    user = get_user(decrypted)

    if not user:
        return dumps({})

    return dumps({
        'username': decrypted,
        'publicKey': user.public_key,
        'mood': user.mood,
        'status': user.status
    })


@user.route(f'/{base_route}/set_public_key', methods=['POST'])
def set_public_key():
    data = get_post_data()
    user = get_user(decrypt_username(get_me()))

    public_key = data.get('publicKey')

    if not check_fields([public_key]):
        return bad_request('Empty file cannot be uploaded')

    if not user:
        return bad_request(ErrorMessage.UNKNOWN_ERROR)

    if (user.public_key or '').strip() == public_key.strip():
        return good_request('Success!')
    else:
        print(ErrorMessage.BREACHED)

    user.public_key = public_key
    return commit_response('Success!')


@user.route(f'/{base_route}/delete_chat')
def delete_chat():
    messages = get_messages_by(get_my_hash())
    for message in messages:
        db.session.delete(message)
    return commit_response()


@user.route(f'/{base_route}/search', methods=['POST'])
def search_user():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    user = get_user(username)
    if not user:
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    decrypted = sym_decrypt(bytes.fromhex(user.username)).decode()

    return good_request(decrypted)


@user.route(f'/{base_route}/add', methods=['POST'])
def add_user():
    data = get_post_data()
    username = data.get('username')
    me = session.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    if me == username:
        return bad_request('Did you just try to befriend yourself?')

    receiver = get_user(username)

    if not receiver:
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    hashed_me = hash_username(decrypt_username(me))
    hashed_notme = hash_username(username)
    friendship = get_friendship(hashed_me, hashed_notme)

    if not friendship:
        friendship = Friendship(
            user1=hashed_me,
            user2=hashed_notme,
            status=RequestStatus.pending
        )

        db.session.add(friendship)
        response = commit_response('Request sent.', 200)
        if response[1] < 300:
            emit(
                EventConstant.EVENT_UPDATE_FRIEND_REQUEST,
                {},
                room=decrypt_room_id(receiver.room),
                namespace=EventConstant.NS_USER
            )
        return response

    elif friendship.status == RequestStatus.accepted:
        return good_request(ErrorMessage.ALREADY_FRIENDS)

    elif friendship.status == RequestStatus.pending:
        return good_request(ErrorMessage.REQUEST_ALREADY_SENT)

    return bad_request(ErrorMessage.INTERNAL_SERVER_ERROR, 500)


@user.route(f'/{base_route}/accept', methods=['POST'])
def accept_friend_request():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    hashed_me = get_my_hash()
    hashed_notme = hash_username(username.strip().lower())

    # Establish friendship
    friendship = get_friendship(hashed_notme, hashed_me)

    if not friendship:
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    elif friendship.status == RequestStatus.accepted:
        return bad_request(ErrorMessage.ALREADY_FRIENDS)

    # Make a chat room for the 2
    room_id = create_room()

    if not room_id:
        return bad_request(ErrorMessage.UNKNOWN_ERROR)

    room = Room(room_id=room_id)
    db.session.add(room)

    # Change friendship status
    friendship.room = room_id
    friendship.status = RequestStatus.accepted

    response = commit_response()
    if response[1] < 300:
        emit_update(
            EventConstant.EVENT_UPDATE_FRIEND_LIST,
            room_id,
            EventConstant.NS_CHAT
        )
    return response


@user.route(f'/{base_route}/reject', methods=['POST'])
def reject_friend_request():
    data = get_post_data()
    username = data.get('username')
    me = get_my_hash()

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    # Find friendship
    friendship = get_friendship(hash_username(username), me)

    if not friendship:
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    elif friendship.status == RequestStatus.accepted:
        return bad_request(ErrorMessage.ALREADY_FRIENDS)

    db.session.delete(friendship)
    return commit_response()


@user.route(f'/{base_route}/friend_requests', methods=['GET'])
def get_requests():
    requests = Friendship.query.filter_by(
        user2=get_my_hash(),
        status=RequestStatus.pending
    ).all()

    senders = []
    for request in requests:
        print(request.user1)
        sender = get_user_by_hash(request.user1)
        senders.append(decrypt_username(sender.username))

    return good_request(dumps(senders))


@user.route(f'/{base_route}/cut_ties', methods=['POST'])
def cut_ties():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    return good_request()
