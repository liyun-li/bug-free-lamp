from flask_sqlalchemy import SQLAlchemy
from enum import Enum


db = SQLAlchemy()


class RequestStatus(Enum):
    __tablename__ = 'request_status'

    accepted = 'Accepted'
    pending = 'Pending'


class User(db.Model):
    __tablename__ = 'user'

    username = db.Column(db.String(255), primary_key=True)
    password = db.Column(db.String(72))  # bcrypt


class Friendship(db.Model):
    """
    `user1` is usually the sender
    `user2` is usually the receiver
    """

    __tablename__ = 'friendship'

    user1 = db.Column(db.String(255), db.ForeignKey(
        f'{User.__tablename__}.username'), primary_key=True)
    user2 = db.Column(db.String(255), db.ForeignKey(
        f'{User.__tablename__}.username'), primary_key=True)
    status = db.Column(db.Enum(RequestStatus))
    room = db.Column(db.String(255))


class Message(db.Model):
    __tablename__ = 'message'

    sender = db.Column(db.String(255), db.ForeignKey(
        f'{User.__tablename__}.username'), primary_key=True)
    receiver = db.Column(db.String(255), db.ForeignKey(
        f'{User.__tablename__}.username'), primary_key=True)

    timestamp = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)

    read_by_sender = db.Column(db.Boolean)
    read_by_receiver = db.Column(db.Boolean)


class Room(db.Model):
    __tablename__ = 'message_channel'

    room_id = db.Column(db.String(255), primary_key=True)


class RoomUserMapping(db.Model):
    __tablename__ = 'channel_user_mapping'

    room = db.Column(db.String(255), db.ForeignKey(
        f'{Room.__tablename__}.room_id'), primary_key=True)
    user = db.Column(db.String(255), db.ForeignKey(
        f'{User.__tablename__}.username'), primary_key=True)
