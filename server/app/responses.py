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


def bad_request(error_message, status_code=400):
    return error_message, status_code


def good_request(message='', status_code=204):
    return message, status_code
