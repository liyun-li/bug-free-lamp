from flask import Blueprint, request, session
from json import dumps
from app.models import RequestStatus, Contact
from app.utils import check_fields, get_user

base_route = 'user'
user = Blueprint(base_route, __name__)


@user.before_request
def before_request_user():
    if request.method != 'OPTIONS' and not session.get('username'):
        return 'Unauthorized', 400


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
        return 'All fields must not be empty.', 400

    user = get_user(username)
    if not user:
        return 'Username not found.', 400

    return dumps(user), 204


@user.route(f'/{base_route}/add', methods=['POST'])
def add_user():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return 'All fields must not be empty.', 400

    user = get_user(username)
    if not user:
        return 'Username not found.', 400

    if user.status == RequestStatus.accepted:
        return 'User has already accepted your request.', 400

    if user.status == RequestStatus.pending:
        return 'You have already sent a request.', 400

    contact = Contact(user_1=session.get('username'))

    return 'Request sent.', 200
