def create_app():
    from flask import Flask
    from flask_cors import CORS
    from flask_session import Session, SqlAlchemySessionInterface

    from app.views import views
    from app.user import user
    from app.auth import auth
    from app.chat import chat
    from app.models import db
    from app.events import socketio

    app = Flask(__name__)

    # configure
    app.config.from_object('config.Config')

    debug_mode = app.config['DEBUG']

    # initialize database
    db.init_app(app)
    with app.app_context():
        if debug_mode or not app.config['SESSION_REDIS']:
            SqlAlchemySessionInterface(app, db, 'sessions', 'sess_')
            # db.drop_all()
        db.create_all()
    app.db = db

    # enable the use of sessions
    Session(app)

    # iniialize socketio
    socketio.init_app(app)
    app.socketio = socketio

    # register blueprints
    app.register_blueprint(views)
    app.register_blueprint(user)
    app.register_blueprint(auth)
    app.register_blueprint(chat)

    # set CORS to accept queries from anywhere
    CORS(app, supports_credentials=True)

    return app
