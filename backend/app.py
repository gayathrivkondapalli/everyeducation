from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import json
from datetime import datetime, timedelta
from database import init_db, seed_sample_data

# Initialize Flask app
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

CORS(app)
jwt = JWTManager(app)

# Initialize database
init_db()

# Import routes
from routes import auth, wellbeing, attendance, grades, alerts

# Register blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(wellbeing.bp)
app.register_blueprint(attendance.bp)
app.register_blueprint(grades.bp)
app.register_blueprint(alerts.bp)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/seed-data', methods=['POST'])
def seed_data():
    """Endpoint to seed sample data"""
    try:
        seed_sample_data()
        return jsonify({'message': 'Sample data seeded successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=False, port=5001, host='127.0.0.1')
