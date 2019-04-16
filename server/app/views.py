from flask import Blueprint

views = Blueprint('views', __name__)


@views.route('/', methods=['GET'])
def index():
    return '', 204
