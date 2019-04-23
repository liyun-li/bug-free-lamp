def create_app():
    from flask import Flask
    from flask_cors import CORS

    from app.views import views
    from app.user import user
    from app.models import db

    app = Flask(__name__)

    # configure
    app.config.from_object('config.Config')

    debug_mode = app.config['DEBUG']

    # initialize database
    db.init_app(app)
    with app.app_context():
        if debug_mode:
            db.drop_all()
        db.create_all()

    app.db = db

    # register blueprints
    app.register_blueprint(views)
    app.register_blueprint(user)

    # set CORS to accept queries from anywhere
    CORS(app, resources={r"/*": {'origins': ['*']}})

    return app
