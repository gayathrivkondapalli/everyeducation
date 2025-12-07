"""
Test cases for wellbeing endpoints
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


class TestWellbeingEndpoints:
    """Test wellbeing endpoints"""

    def test_record_wellbeing(self, client, setup_db):
        """Test recording wellbeing data"""
        response = client.post('/api/wellbeing/record',
            data=json.dumps({
                'student_id': 1,
                'sleep_level': 7,
                'stress_level': 4,
                'mood': 'happy',
                'comments': 'Feeling good today'
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'record_id' in data

    def test_record_wellbeing_high_stress_creates_alert(self, client, setup_db):
        """Test that high stress level creates an alert"""
        response = client.post('/api/wellbeing/record',
            data=json.dumps({
                'student_id': 1,
                'sleep_level': 5,
                'stress_level': 9,  # High stress > 8
                'mood': 'anxious'
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
        
        # Check alert was created
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM alerts WHERE student_id = 1 AND alert_type = "high_stress"')
        alerts = c.fetchall()
        conn.close()
        assert len(alerts) > 0

    def test_record_wellbeing_low_sleep_creates_alert(self, client, setup_db):
        """Test that low sleep level creates an alert"""
        response = client.post('/api/wellbeing/record',
            data=json.dumps({
                'student_id': 2,
                'sleep_level': 2,  # Low sleep <= 3
                'stress_level': 5,
                'mood': 'tired'
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
        
        # Check alert was created
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM alerts WHERE student_id = 2 AND alert_type = "low_sleep"')
        alerts = c.fetchall()
        conn.close()
        assert len(alerts) > 0

    def test_get_student_wellbeing_records(self, client, setup_db):
        """Test fetching student wellbeing records"""
        # First create a record
        client.post('/api/wellbeing/record',
            data=json.dumps({
                'student_id': 5,
                'sleep_level': 8,
                'stress_level': 3,
                'mood': 'calm'
            }),
            content_type='application/json'
        )
        
        response = client.get('/api/wellbeing/records/5')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_wellbeing_alerts(self, client, setup_db):
        """Test fetching wellbeing alerts"""
        response = client.get('/api/wellbeing/alerts')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_stress_over_time(self, client, setup_db):
        """Test getting stress levels over time"""
        response = client.get('/api/wellbeing/stress-over-time?days=30')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_heatmap_data(self, client, setup_db):
        """Test getting heatmap data"""
        response = client.get('/api/wellbeing/heatmap-data')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_students_status_paginated(self, client, setup_db):
        """Test paginated students status endpoint"""
        response = client.get('/api/wellbeing/students-status?page=1&per_page=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'students' in data
        assert 'total' in data
        assert 'page' in data
        assert 'per_page' in data
        assert 'total_pages' in data
        assert data['page'] == 1
        assert data['per_page'] == 10

    def test_get_students_status_with_search(self, client, setup_db):
        """Test students status endpoint with search"""
        response = client.get('/api/wellbeing/students-status?search=Emma&page=1&per_page=10')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'students' in data
        # All returned students should have Emma in their name
        for student in data['students']:
            name = f"{student['first_name']} {student['last_name']} {student['email']}"
            assert 'emma' in name.lower()
