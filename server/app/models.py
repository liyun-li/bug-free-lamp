from flask_sqlalchemy import SQLAlchemy
from enum import Enum
from app.constants import ModelConstant


db = SQLAlchemy()

encrypted_room_id_size = (
    ModelConstant.ROOM_ID_SIZE +
    ModelConstant.GCM_NONCE_SIZE +
    ModelConstant.GCM_TAG_SIZE
) * 2


class RequestStatus(Enum):
    __tablename__ = 'request_status'

    accepted = 'Accepted'
    pending = 'Pending'


class Room(db.Model):
    __tablename__ = 'room'

    # Encrypted Room ID
    # First 16 bytes are authentication tag for decryption
    room_id = db.Column(
        db.String(encrypted_room_id_size),
        primary_key=True
    )


class User(db.Model):
    __tablename__ = 'user'

    system_username = db.Column(
        db.String(ModelConstant.USERNAME_SIZE),
        primary_key=True
    )

    username = db.Column(
        db.String(ModelConstant.USERNAME_SIZE)
    )

    password = db.Column(db.String(72))  # bcrypt max length

    room = db.Column(
        db.String(encrypted_room_id_size),
        db.ForeignKey(f'{Room.__tablename__}.room_id')
    )

    __table_args__ = (
        db.UniqueConstraint(username),
        db.UniqueConstraint(room)
    )


class Friendship(db.Model):
    """
    `user1` is usually the sender
    `user2` is usually the receiver
    """

    __tablename__ = 'friendship'

    user1 = db.Column(
        db.String(ModelConstant.USERNAME_SIZE),
        db.ForeignKey(f'{User.__tablename__}.username'),
        primary_key=True
    )
    user2 = db.Column(
        db.String(ModelConstant.USERNAME_SIZE),
        db.ForeignKey(f'{User.__tablename__}.username'),
        primary_key=True
    )
    status = db.Column(db.Enum(RequestStatus))
    room = db.Column(
        db.String(encrypted_room_id_size),
        db.ForeignKey(f'{Room.__tablename__}.room_id')
    )

    __table_args__ = (
        db.UniqueConstraint(room),
    )


class Message(db.Model):
    __tablename__ = 'message'

    sender = db.Column(
        db.String(ModelConstant.USERNAME_SIZE),
        db.ForeignKey(f'{User.__tablename__}.username'),
        primary_key=True
    )

    receiver = db.Column(
        db.String(ModelConstant.USERNAME_SIZE),
        db.ForeignKey(f'{User.__tablename__}.username'),
        primary_key=True
    )

    timestamp = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)

    read_by_receiver = db.Column(db.Boolean)


class RoomUserMapping(db.Model):
    __tablename__ = 'room_user_mapping'

    room = db.Column(
        db.String(encrypted_room_id_size),
        db.ForeignKey(f'{Room.__tablename__}.room_id'),
        primary_key=True
    )
    user = db.Column(
        db.String(ModelConstant.USERNAME_SIZE),
        db.ForeignKey(f'{User.__tablename__}.username'),
        primary_key=True
    )
