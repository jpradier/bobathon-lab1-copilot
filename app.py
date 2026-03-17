import os
from flask import Flask, render_template
from flask_cors import CORS

from config import Config
from models.todo import db
from routes.api import api

# Application factory function
def create_app(config_class=Config):
    """Application factory function."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(api)
    
    # Create database tables
    with app.app_context():
        # Ensure instance folder exists
        os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)
        db.create_all()
    
    # Serve frontend
    @app.route('/')
    def index():
        return render_template('index.html')
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
