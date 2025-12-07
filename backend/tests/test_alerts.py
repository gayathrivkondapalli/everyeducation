"""
Test cases for alerts endpoints
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import init_db, get_db_connection
import json


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


class TestAlertsEndpoints:
    """Test alerts endpoints"""

    def test_create_alert(self, client, setup_db):
        """Test creating an alert"""
        response = client.post('/api/alerts/create',
            data=json.dumps({
                'student_id': 1,
                'alert_type': 'high_stress',
                'message': 'Test alert message'
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'alert_id' in data

    def test_get_unread_alerts(self, client, setup_db):
        """Test fetching unread alerts"""
        response = client.get('/api/alerts/unread')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_student_alerts(self, client, setup_db):
        """Test fetching alerts for a specific student"""
        # Create an alert first
        client.post('/api/alerts/create',
            data=json.dumps({
                'student_id': 5,
                'alert_type': 'low_sleep',
                'message': 'Student 5 has low sleep'
            }),
            content_type='application/json'
        )
        
        response = client.get('/api/alerts/student/5')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_mark_alert_read(self, client, setup_db):
        """Test marking an alert as read"""
        # Create an alert first
        create_response = client.post('/api/alerts/create',
            data=json.dumps({
                'student_id': 3,
                'alert_type': 'high_stress',
                'message': 'Test alert to mark read'
            }),
            content_type='application/json'
        )
        alert_id = json.loads(create_response.data)['alert_id']
        
        # Mark as read
        response = client.put(f'/api/alerts/mark-read/{alert_id}')
        assert response.status_code == 200

    def test_alert_types_filtering(self, client, setup_db):
        """Test that alerts are properly typed"""
        # Create different types of alerts
        client.post('/api/alerts/create',
            data=json.dumps({
                'student_id': 1,
                'alert_type': 'high_stress',
                'message': 'High stress alert'
            }),
            content_type='application/json'
        )
        client.post('/api/alerts/create',
            data=json.dumps({
                'student_id': 2,
                'alert_type': 'low_attendance',
                'message': 'Low attendance alert'
            }),
            content_type='application/json'
        )
        
        response = client.get('/api/alerts/unread')
        data = json.loads(response.data)
        
        # Check that we have different alert types
        alert_types = [a['alert_type'] for a in data]
        assert 'high_stress' in alert_types or 'low_attendance' in alert_types
