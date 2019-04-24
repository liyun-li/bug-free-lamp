from flask_sqlalchemy import SQLAlchemy
from enum import Enum


db = SQLAlchemy()


class RequestStatus(Enum):
    accepted = 'Accepted'
    pending = 'Pending'


class User(db.Model):
    username = db.Column(db.String(255), primary_key=True)
    password = db.Column(db.String(72))  # bcrypt


class Contact(db.Model):
    user1 = db.Column(db.String(255), db.ForeignKey(
        f'{User.__tablename__}.username'), primary_key=True)
    user2 = db.Column(db.String(255), db.ForeignKey(
        f'{User.__tablename__}.username'), primary_key=True)
    status = db.Column(db.Enum(RequestStatus))
