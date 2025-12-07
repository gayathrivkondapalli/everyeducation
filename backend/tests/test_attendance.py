"""
Test cases for attendance endpoints
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


class TestAttendanceEndpoints:
    """Test attendance endpoints"""

    def test_record_attendance_present(self, client, setup_db):
        """Test recording attendance as present"""
        response = client.post('/api/attendance/record',
            data=json.dumps({
                'student_id': 1,
                'class_date': '2025-12-06',
                'present': True
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'record_id' in data

    def test_record_attendance_absent(self, client, setup_db):
        """Test recording attendance as absent"""
        response = client.post('/api/attendance/record',
            data=json.dumps({
                'student_id': 2,
                'class_date': '2025-12-06',
                'present': False
            }),
            content_type='application/json'
        )
        assert response.status_code == 201

    def test_get_student_attendance(self, client, setup_db):
        """Test fetching student attendance"""
        response = client.get('/api/attendance/student/1?days=30')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_absent_students(self, client, setup_db):
        """Test fetching students with low attendance"""
        response = client.get('/api/attendance/absent-students?days=30&threshold=0.7')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_attendance_summary(self, client, setup_db):
        """Test fetching attendance summary"""
        response = client.get('/api/attendance/summary')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_students' in data or isinstance(data, dict)

    def test_get_attendance_grades_correlation(self, client, setup_db):
        """Test fetching attendance-grades correlation"""
        response = client.get('/api/attendance/attendance-grades-correlation?days=30')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
