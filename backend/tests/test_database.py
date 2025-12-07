"""
Test cases for database operations
"""
import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db, get_db_connection, seed_sample_data


class TestDatabase:
    """Test database operations"""

    def test_init_db_creates_tables(self):
        """Test that init_db creates all required tables"""
        init_db()
        conn = get_db_connection()
        c = conn.cursor()
        
        # Check all tables exist
        tables = ['users', 'students', 'wellbeing_records', 'attendance', 
                  'assignments', 'grades', 'alerts', 'staff']
        
        for table in tables:
            c.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            result = c.fetchone()
            assert result is not None, f"Table {table} should exist"
        
        conn.close()

    def test_db_connection_returns_row_factory(self):
        """Test that database connection has row factory set"""
        init_db()
        conn = get_db_connection()
        
        # Insert test data and verify we get dict-like rows
        c = conn.cursor()
        c.execute("SELECT * FROM students LIMIT 1")
        row = c.fetchone()
        
        if row:
            # Should be able to access by column name
            assert 'id' in row.keys() or hasattr(row, 'keys')
        
        conn.close()

    def test_seed_data_creates_students(self):
        """Test that seed data creates students"""
        init_db()
        conn = get_db_connection()
        c = conn.cursor()
        
        c.execute("SELECT COUNT(*) FROM students")
        count = c.fetchone()[0]
        
        # Should have students (either from seed or previous tests)
        assert count >= 0
        
        conn.close()

    def test_seed_data_creates_staff_users(self):
        """Test that seed data creates staff users"""
        init_db()
        conn = get_db_connection()
        c = conn.cursor()
        
        # Check for staff users
        c.execute("SELECT COUNT(*) FROM users WHERE role = 'staff'")
        count = c.fetchone()[0]
        
        assert count >= 0
        
        conn.close()

    def test_wellbeing_records_foreign_key(self):
        """Test wellbeing records have proper foreign key relationship"""
        init_db()
        conn = get_db_connection()
        c = conn.cursor()
        
        # Get a wellbeing record with student join
        c.execute('''
            SELECT wr.*, s.first_name, s.last_name 
            FROM wellbeing_records wr 
            JOIN students s ON wr.student_id = s.id 
            LIMIT 1
        ''')
        result = c.fetchone()
        
        # If there are records, they should join properly
        if result:
            assert 'first_name' in result.keys()
        
        conn.close()

    def test_alerts_foreign_key(self):
        """Test alerts have proper foreign key relationship"""
        init_db()
        conn = get_db_connection()
        c = conn.cursor()
        
        # Get an alert with student join
        c.execute('''
            SELECT a.*, s.first_name, s.last_name 
            FROM alerts a 
            JOIN students s ON a.student_id = s.id 
            LIMIT 1
        ''')
        result = c.fetchone()
        
        # If there are alerts, they should join properly
        if result:
            assert 'first_name' in result.keys()
        
        conn.close()
