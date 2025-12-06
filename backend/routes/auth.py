from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection
import sqlite3

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = None
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        hashed_password = generate_password_hash(data['password'])
        c.execute('''INSERT INTO users (username, password, email, role) 
                     VALUES (?, ?, ?, ?)''',
                  (data['username'], hashed_password, data['email'], data.get('role', 'student')))
        
        conn.commit()
        user_id = c.lastrowid
        
        return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201
    
    except sqlite3.IntegrityError as e:
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    conn = None
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        c.execute('SELECT * FROM users WHERE username = ?', (data['username'],))
        user = c.fetchone()
        
        if user and check_password_hash(user['password'], data['password']):
            access_token = create_access_token(identity=user['id'])
            return jsonify({
                'access_token': access_token,
                'user_id': user['id'],
                'username': user['username'],
                'role': user['role']
            }), 200
        
        return jsonify({'error': 'Invalid username or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    from flask_jwt_extended import jwt_required, get_jwt_identity
    
    # This endpoint would require JWT authentication
    return jsonify({'message': 'Profile endpoint'}), 200
