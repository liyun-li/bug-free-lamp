from flask import session
from flask_socketio import SocketIO, emit, join_room, leave_room
from app.constants import EventConstant, SessionConstant
from app.models import Room, RoomUserMapping
from app.chat import base_route
from time import time

socketio = SocketIO()


@socketio.on('login', namespace=EventConstant.NS_USER)
def join_chat():
    room_id = session.get(SessionConstant.ROOM)
    join_room(room_id)


@socketio.on('logout', namespace=EventConstant.NS_USER)
def leave_chat():
    room_id = session.get(SessionConstant.ROOM)
    leave_room(room_id)
