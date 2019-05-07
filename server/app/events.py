from flask import session
from flask_socketio import SocketIO, emit, join_room, leave_room
from app.constants import EventConstant, SessionConstant, ErrorMessage
from app.models import Room, RoomUserMapping
from app.utils import check_fields, get_friendship, sym_decrypt, get_me
from time import time

socketio = SocketIO()


def emit_update(event, room, namespace):
    emit(event, {}, room=room, namespace=namespace)


def emit_error(message):
    emit(EventConstant.EVENT_STATUS_UPDATE, {
        'status': EventConstant.STATUS_FALIURE,
        'message': message
    })


def emit_ok(message=''):
    emit(EventConstant.EVENT_STATUS_UPDATE, {
        'status': EventConstant.STATUS_FALIURE,
        'message': message
    })


@socketio.on('login', namespace=EventConstant.NS_USER)
def login(_data):
    room_id = session.get(SessionConstant.UPDATE_STREAM)
    join_room(room_id)
    emit_ok('You have logged in.')


@socketio.on('logout', namespace=EventConstant.NS_USER)
def logout(_data):
    room_id = session.get(SessionConstant.UPDATE_STREAM)
    leave_room(room_id)
    emit_ok('You have logged out.')


@socketio.on('join_chat', namespace=EventConstant.NS_CHAT)
def join_chat(data):
    friend = data.get('username')
    me = get_me()

    if not check_fields([friend]):
        emit_error(ErrorMessage.USER_NOT_FOUND)
        return

    friendship = get_friendship(me, friend)

    if not friendship:
        emit_error(ErrorMessage.NOT_FRIEND)
        return

    if not friendship.room:
        emit_error(ErrorMessage.UNKNOWN_ERROR)
        return

    room_id_bytes = bytes.fromhex(friendship.room)
    room_id = sym_decrypt(room_id_bytes)
    if not room_id:
        emit_error(ErrorMessage.BREACHED)
        return

    session[SessionConstant.ROOM] = room_id
    join_room(room_id)
    emit_ok()
