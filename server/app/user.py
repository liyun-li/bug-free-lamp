from flask import Blueprint, request, session
from flask_socketio import emit
from json import dumps
from app.models import db, RequestStatus, Friendship, Room
from app.constants import ModelConstant, SessionConstant, ErrorMessage, \
    EventConstant
from app.utils import check_fields, get_user, safer_commit, get_friendship, \
    commit_response, get_post_data, sym_encrypt, create_room, \
    bad_request, good_request, get_me, asym_decrypt
from app.events import emit_update

base_route = 'user'
user = Blueprint(base_route, __name__)


@user.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return bad_request(ErrorMessage.UNAUTHORIZED, 403)


@user.route(f'/{base_route}/hi')
def hi():
    user = get_user(get_me())
    return dumps({
        'username': user.username,
        'publicKey': user.public_key,
        'mood': user.mood,
        'status': user.status
    })


@user.route(f'/{base_route}/set_public_key', methods=['POST'])
def set_public_key():
    data = get_post_data()
    user = get_user(get_me())

    public_key = data.get('publicKey')
    ciphertext = data.get('message')

    if not check_fields([public_key, ciphertext]):
        return bad_request('Empty file cannot be uploaded')

    if not user:
        return bad_request(ErrorMessage.UNKNOWN_ERROR)

    if user.public_key and user.public_key == public_key:
        return good_request('Success!')

    plaintext = 'I have a cat that is very chubby'
    if asym_decrypt(public_key, ciphertext).decode() != plaintext:
        return bad_request('Invalid key')

    user.public_key = public_key
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

    return good_request(user.username)


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

    friendship = get_friendship(me, username)

    if not friendship:
        friendship = Friendship(
            user1=me,
            user2=username,
            status=RequestStatus.pending
        )

        db.session.add(friendship)
        response = commit_response('Request sent.', 200)
        if response[1] < 300:
            emit(
                EventConstant.EVENT_UPDATE_FRIEND_REQUEST,
                {},
                room=receiver.room,
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

    # Establish friendship
    friendship = get_friendship(username, session.get('username'))

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

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    # Find friendship
    friendship = get_friendship(username, session.get('username'))

    if not friendship:
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    elif friendship.status == RequestStatus.accepted:
        return bad_request(ErrorMessage.ALREADY_FRIENDS)

    db.session.delete(friendship)
    return commit_response()


@user.route(f'/{base_route}/friend_requests', methods=['GET'])
def get_requests():
    me = session.get('username')

    requests = Friendship.query.filter_by(
        user2=me,
        status=RequestStatus.pending
    ).all()
    senders = [request.user1 for request in requests]

    return good_request(dumps(senders))


@user.route(f'/{base_route}/cut_ties', methods=['POST'])
def cut_ties():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    return good_request()
