from flask import Blueprint, request, session

from app.utils import check_fields, get_user, register_user, \
    check_username_password, get_post_data


user = Blueprint('user', __name__)


@user.route('/login', methods=['POST'])
def login():
    data = get_post_data()
    username = data.get('username')
    password = data.get('password')

    if not check_fields([username, password]):
        return 'All fields must not be empty.', 400

    if not check_username_password(username, password):
        return 'Invalid credential', 400

    session['username'] = username

    return '', 204


@user.route('/register', methods=['POST'])
def register():
    data = get_post_data()
    username = data.get('username')
    password = data.get('password')

    if not check_fields([username, password]):
        return 'All fields must not be empty.', 400

    if not register_user(username, password):
        return 'Username exists', 400

    session['username'] = username

    return '', 204


@user.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return '', 204
