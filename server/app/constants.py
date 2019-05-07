class EventConstant:
    """NS = Namespace"""
    NS_CHAT = '/chat'
    NS_USER = '/me'
    STATUS_SUCCESS = 'success'
    STATUS_FALIURE = 'error'
    EVENT_STATUS_UPDATE = 'update user status'
    EVENT_UPDATE_FRIEND_REQUEST = 'update friend request'
    EVENT_UPDATE_FRIEND_LIST = 'update friend list'
    EVENT_GET_FRIENDS = 'get friends'
    EVENT_GET_NEW_MESSAGE = 'get new message'


class SessionConstant:
    USERNAME = 'username'
    USERNAME_HASH = 'username_hash'
    UPDATE_STREAM = 'update_stream'
    ROOM = 'room'


class ModelConstant:
    USERNAME_SIZE = 32
    ROOM_ID_SIZE = 128
    GCM_TAG_SIZE = 16
    GCM_NONCE_SIZE = 16


class ErrorMessage:
    EMPTY_FIELDS = 'All fields must not be empty.'
    EMPTY_MESSAGE = 'Message must not be empty.'
    UNAUTHORIZED = 'Unauthorized.'
    USER_NOT_FOUND = 'User not found.'
    INTERNAL_SERVER_ERROR = 'Internal Server Error.'
    ALREADY_FRIENDS = 'User has already accepted your request.'
    REQUEST_ALREADY_SENT = 'You have already sent a request.'
    INVALID_TIMESTAMP = 'Invalid timestamp.'
    INVALID_CREDENTIAL = 'Invalid credential.'
    USERNAME_ALREADY_EXISTS = 'Username exists.'
    REGISTRATION_ERROR = 'Error during registration.'
    NOT_FRIEND = 'This user is not your friend.'
    UNKNOWN_ERROR = 'An unknown error occurred.'
    BREACHED = 'Someone might have breached the system!'
