from flask import Blueprint, request, session
from json import dumps
from os import urandom
from app.models import db, RequestStatus, Friendship, Room
from app.responses import ErrorMessage, bad_request, good_request
from app.utils import check_fields, get_user, safer_commit, get_friendship, \
    commit_response, get_post_data

base_route = 'user'
user = Blueprint(base_route, __name__)


@user.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return bad_request(ErrorMessage.UNAUTHORIZED, 403)


@user.route(f'/{base_route}/hi')
def hi():
    return good_request()


@user.route(f'/{base_route}/logout')
def logout():
    session.clear()
    return good_request()


@user.route(f'/{base_route}/search', methods=['POST'])
def search_user():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    user = get_user(username)
    if not user:
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    return good_request(user.username, 200)


@user.route(f'/{base_route}/add', methods=['POST'])
def add_user():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    if session.get('username') == username:
        return bad_request('Did you just try to befriend yourself?')

    if not get_user(username):
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    friendship = get_friendship(session.get('username'), username)

    if not friendship:
        friendship = Friendship(
            user1=session.get('username'),
            user2=username,
            status=RequestStatus.pending
        )

        db.session.add(friendship)
        return commit_response('Request sent.')

    elif friendship.status == RequestStatus.accepted:
        return good_request(ErrorMessage.ALREADY_FRIENDS, 200)

    elif friendship.status == RequestStatus.pending:
        return good_request(ErrorMessage.REQUEST_ALREADY_SENT, 200)

    return bad_request(ErrorMessage.INTERNAL_SERVER_ERROR, 500)


@user.route(f'/{base_route}/accept', methods=['POST'])
def accept_friend_request():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return bad_request(ErrorMessage.EMPTY_FIELDS)

    # Establish friendship
    friendship = get_friendship(username, session.get('username'))

    # Make a chat room for the 2
    room = urandom(Room.room_id.size)

    if not friendship:
        return bad_request(ErrorMessage.USER_NOT_FOUND)

    elif friendship.status == RequestStatus.accepted:
        return bad_request(ErrorMessage.ALREADY_FRIENDS)

    friendship.status = RequestStatus.accepted

    return commit_response()


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
    data = get_post_data()
    me = data.get('session')

    requests = Friendship.query.filter_by(user2=me).all()
    senders = [request.user1 for request in requests]

    return good_request(dumps(senders), 200)


@user.route(f'/{base_route}/cut_ties', methods=['POST'])
def cut_ties():
    data = get_post_data()
    username = data.get('username')
