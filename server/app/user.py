from flask import Blueprint, request, session
from json import dumps
from app.models import RequestStatus, Contact
from app.utils import check_fields, get_user

user = Blueprint('user', __name__)


@user.before_request
def before_request_user():
    if not session.get('username'):
        return 'Unauthorized', 400


@user.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return '', 204


@user.route('/user/search', methods=['POST'])
def search_user():
    data = get_post_data()
    username = data.get('username')

    if not check_fields([username]):
        return 'All fields must not be empty.', 400

    user = get_user(username)
    if not user:
        return 'Username not found.', 400

    return dumps(user), 204


@user.route('/user/add', methods=['POST'])
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
