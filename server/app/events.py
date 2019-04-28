from flask import session
from flask_socketio import SocketIO, emit, join_room, leave_room
from app.models import Room, RoomUserMapping
from app.chat import base_route
from time import time

socketio = SocketIO()


@socketio.on('join_chat', namespace=base_route)
def join_chat(room):
    """Join a channel."""

    if type(room) != 'string':
        return

    username = session.get('username')
    join_room(room)
    emit('status', f'`{username}` joined the chat.', room=room)


@socketio.on('message', namespace=base_route)
def message(message):
    """Send a message."""

    if type(message) != 'string':
        return

    username = session.get('username')
    room = session.get('room')
    emit('message', {
        'username': username,
        'message': message,
        'timestamp': int(time())
    })


@socketio.on('leave_chat', namespace=base_route)
def leave_chat(_message):
    """Leave a channel."""

    room = session.get('room')
    leave_room(room)
    emit('status', f'{username} left the chat.', room=room)
