"""
Test cases for authentication endpoints
"""
import pytest
import sys
import os
import uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import init_db, get_db_connection
import json


def unique_id():
    """Generate unique ID for test data"""
    return str(uuid.uuid4())[:8]


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def setup_db():
    """Setup test database"""
    init_db()
    yield
    # Cleanup if needed


class TestAuthEndpoints:
    """Test authentication endpoints"""

    def test_register_new_user(self, client, setup_db):
        """Test registering a new user"""
        uid = unique_id()
        response = client.post('/api/auth/register', 
            data=json.dumps({
                'username': f'testuser_{uid}',
                'email': f'testuser_{uid}@test.com',
                'password': 'testpass123',
                'role': 'student'
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'User registered successfully'

    def test_register_duplicate_username(self, client, setup_db):
        """Test registering with duplicate username fails"""
        uid = unique_id()
        # First registration
        client.post('/api/auth/register',
            data=json.dumps({
                'username': f'dupuser_{uid}',
                'email': f'dup1_{uid}@test.com',
                'password': 'testpass123',
                'role': 'student'
            }),
            content_type='application/json'
        )
        
        # Duplicate registration
        response = client.post('/api/auth/register',
            data=json.dumps({
                'username': f'dupuser_{uid}',
                'email': f'dup2_{uid}@test.com',
                'password': 'testpass123',
                'role': 'student'
            }),
            content_type='application/json'
        )
        assert response.status_code == 409  # Conflict for duplicate

    def test_register_missing_fields(self, client, setup_db):
        """Test registration with missing fields fails"""
        response = client.post('/api/auth/register',
            data=json.dumps({
                'username': 'incomplete'
            }),
            content_type='application/json'
        )
        assert response.status_code == 400

    def test_login_valid_credentials(self, client, setup_db):
        """Test login with valid credentials"""
        # Register first
        client.post('/api/auth/register',
            data=json.dumps({
                'username': 'logintest',
                'email': 'logintest@test.com',
                'password': 'testpass123',
                'role': 'student'
            }),
            content_type='application/json'
        )
        
        # Now login
        response = client.post('/api/auth/login',
            data=json.dumps({
                'username': 'logintest',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'access_token' in data
        assert 'role' in data
        assert data['role'] == 'student'

    def test_login_invalid_password(self, client, setup_db):
        """Test login with wrong password fails"""
        response = client.post('/api/auth/login',
            data=json.dumps({
                'username': 'kayla',
                'password': 'wrongpassword'
            }),
            content_type='application/json'
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client, setup_db):
        """Test login with non-existent user fails"""
        response = client.post('/api/auth/login',
            data=json.dumps({
                'username': 'nonexistent',
                'password': 'anypassword'
            }),
            content_type='application/json'
        )
        assert response.status_code == 401

    def test_login_missing_credentials(self, client, setup_db):
        """Test login without credentials fails"""
        response = client.post('/api/auth/login',
            data=json.dumps({}),
            content_type='application/json'
        )
        assert response.status_code == 400
