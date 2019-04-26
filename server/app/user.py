from flask import Blueprint, request, session
from json import dumps
from app.models import RequestStatus, Friendship
from app.responses import ErrorMessage
from app.utils import check_fields, get_user, safer_commit, get_friendship, \
    commit_response

base_route = 'user'
user = Blueprint(base_route, __name__)


@user.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return ErrorMessage.UNAUTHORIZED, 403


@user.route(f'/{base_route}/hi')
def hi():
    return '', 204


@user.route(f'/{base_route}/logout')
def logout():
    session.clear()
    return '', 204


@user.route(f'/{base_route}/search', methods=['POST'])
def search_user():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return ErrorMessage.EMPTY_FIELDS, 400

    user = get_user(username)
    if not user:
        return ErrorMessage.USER_NOT_FOUND, 400

    return dumps(user), 204


@user.route(f'/{base_route}/add', methods=['POST'])
def add_user():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return ErrorMessage.EMPTY_FIELDS, 400

    if not get_user(username):
        return ErrorMessage.USER_NOT_FOUND, 400

    friendship = get_friendship(session.get('username'), user)

    if not friendship:
        friendship = Friendship(
            user1=session.get('username'),
            user2=username,
            status=RequestStatus.pending
        )

        db.session.add(friendship)
        return commit_response('Request sent.')

    elif friendship.status == RequestStatus.accepted:
        return ErrorMessage.ALREADY_FRIENDS, 200

    elif friendship.status == RequestStatus.pending:
        return ErrorMessage.REQUEST_ALREADY_SENT, 200

    return ErrorMessage.INTERNAL_SERVER_ERROR, 500


@user.route(f'/{base_route}/accept', methods=['POST'])
def accept_friend_request():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return ErrorMessage.EMPTY_FIELDS, 400

    friendship = get_friendship(username, session.get('username'))

    if not friendship:
        return ErrorMessage.USER_NOT_FOUND, 400

    elif friendship.status == RequestStatus.accepted:
        return ErrorMessage.ALREADY_FRIENDS, 400

    friendship.status = RequestStatus.accepted

    return commit_response()
