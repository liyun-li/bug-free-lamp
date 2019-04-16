def create_app():
    from flask import Flask
    from app.views import views
    from app.models import db

    app = Flask(__name__)

    # register blueprints
    app.register_blueprint(views)

    # configure
    app.config.from_object('config.Config')

    # initialize database
    db.init_app(app)
    with app.app_context():
        if app.config['DEBUG']:
            db.drop_all()
        db.create_all()
    app.db = db

    return app
