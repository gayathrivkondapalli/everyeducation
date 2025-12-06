from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime, timedelta
import json

bp = Blueprint('wellbeing', __name__, url_prefix='/api/wellbeing')

@bp.route('/record', methods=['POST'])
def record_wellbeing():
    """Record wellbeing data for a student"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    # Get student_id - could be user_id for logged in students
    student_id = data.get('student_id')
    
    conn = None
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Combine comments and requests into notes
        notes_parts = []
        if data.get('comments'):
            notes_parts.append(f"Comments: {data.get('comments')}")
        if data.get('requests'):
            notes_parts.append(f"Requests: {data.get('requests')}")
        notes = "\n".join(notes_parts) if notes_parts else data.get('notes')
        
        c.execute('''INSERT INTO wellbeing_records 
                     (student_id, sleep_level, stress_level, mood, mental_health_notes) 
                     VALUES (?, ?, ?, ?, ?)''',
                  (student_id or 1,  # Default to 1 if no student_id provided
                   data.get('sleep_level'),
                   data.get('stress_level'),
                   data.get('mood'),
                   notes))
        
        conn.commit()
        record_id = c.lastrowid
        
        # Create alert if stress is high or sleep is low
        if data.get('stress_level') and int(data.get('stress_level')) >= 8:
            c.execute('''INSERT INTO alerts (student_id, alert_type, message)
                         VALUES (?, ?, ?)''',
                      (student_id or 1, 'high_stress', 
                       f'High stress level ({data.get("stress_level")}/10) reported. Mood: {data.get("mood", "Not specified")}'))
            conn.commit()
        
        if data.get('sleep_level') and int(data.get('sleep_level')) <= 3:
            c.execute('''INSERT INTO alerts (student_id, alert_type, message)
                         VALUES (?, ?, ?)''',
                      (student_id or 1, 'low_sleep', 
                       f'Low sleep quality ({data.get("sleep_level")}/10) reported.'))
            conn.commit()
        
        return jsonify({'message': 'Wellbeing record created', 'record_id': record_id}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/records/<int:student_id>', methods=['GET'])
def get_student_wellbeing(student_id):
    """Get wellbeing records for a student"""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Get last 30 days
    days = request.args.get('days', 30, type=int)
    
    c.execute('''SELECT * FROM wellbeing_records 
                 WHERE student_id = ? 
                 AND recorded_date >= datetime('now', '-' || ? || ' days')
                 ORDER BY recorded_date DESC''',
              (student_id, days))
    
    records = c.fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in records]), 200

@bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get alerts for low sleep or high stress"""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Get students with high stress (>7) or low sleep (<4) in last 7 days
    c.execute('''SELECT DISTINCT s.id, s.first_name, s.last_name, 
                 wr.stress_level, wr.sleep_level, wr.recorded_date
                 FROM students s
                 JOIN wellbeing_records wr ON s.id = wr.student_id
                 WHERE (wr.stress_level > ? OR wr.sleep_level < ?)
                 AND wr.recorded_date >= datetime('now', '-7 days')
                 ORDER BY wr.recorded_date DESC''',
              (7, 4))
    
    alerts = c.fetchall()
    conn.close()
    
    return jsonify([dict(a) for a in alerts]), 200

@bp.route('/stress-over-time', methods=['GET'])
def get_stress_over_time():
    """Get stress levels over time for line chart"""
    student_id = request.args.get('student_id', type=int)
    days = request.args.get('days', 30, type=int)
    
    conn = get_db_connection()
    c = conn.cursor()
    
    if student_id:
        c.execute('''SELECT recorded_date, stress_level 
                     FROM wellbeing_records
                     WHERE student_id = ?
                     AND recorded_date >= datetime('now', '-' || ? || ' days')
                     ORDER BY recorded_date ASC''',
                  (student_id, days))
    else:
        # Get average stress level across all students by day
        c.execute('''SELECT date(recorded_date) as date, AVG(stress_level) as avg_stress
                     FROM wellbeing_records
                     WHERE recorded_date >= datetime('now', '-' || ? || ' days')
                     GROUP BY date(recorded_date)
                     ORDER BY recorded_date ASC''',
                  (days,))
    
    records = c.fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in records]), 200

@bp.route('/heatmap-data', methods=['GET'])
def get_heatmap_data():
    """Get stress level heatmap data"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT s.id, s.first_name, s.last_name,
                 AVG(wr.stress_level) as avg_stress,
                 MIN(wr.sleep_level) as min_sleep,
                 COUNT(*) as record_count
                 FROM students s
                 LEFT JOIN wellbeing_records wr ON s.id = wr.student_id
                 WHERE wr.recorded_date >= datetime('now', '-30 days')
                 GROUP BY s.id''')
    
    data = c.fetchall()
    conn.close()
    
    return jsonify([dict(d) for d in data]), 200

@bp.route('/students-status', methods=['GET'])
def get_students_status():
    """Get students with their wellbeing form status (paginated)"""
    conn = None
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '', type=str)
        offset = (page - 1) * per_page
        
        # Build search condition
        search_condition = ""
        params = []
        if search:
            search_condition = "WHERE s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ? OR s.email LIKE ?"
            search_term = f'%{search}%'
            params = [search_term, search_term, search_term, search_term]
        
        # Get total count
        count_query = f'SELECT COUNT(*) FROM students s {search_condition}'
        c.execute(count_query, params)
        total = c.fetchone()[0]
        
        # Get paginated students with their latest wellbeing data
        query = f'''
            SELECT 
                s.id,
                s.student_id,
                s.first_name,
                s.last_name,
                s.email,
                (SELECT COUNT(*) > 0 FROM wellbeing_records wr 
                 WHERE wr.student_id = s.id 
                 AND date(wr.recorded_date) = date('now')) as has_filled_today,
                (SELECT MAX(recorded_date) FROM wellbeing_records wr 
                 WHERE wr.student_id = s.id) as last_submission,
                (SELECT stress_level FROM wellbeing_records wr 
                 WHERE wr.student_id = s.id 
                 ORDER BY recorded_date DESC LIMIT 1) as latest_stress,
                (SELECT mood FROM wellbeing_records wr 
                 WHERE wr.student_id = s.id 
                 ORDER BY recorded_date DESC LIMIT 1) as latest_mood,
                (SELECT sleep_level FROM wellbeing_records wr 
                 WHERE wr.student_id = s.id 
                 ORDER BY recorded_date DESC LIMIT 1) as latest_sleep
            FROM students s
            {search_condition}
            ORDER BY s.last_name, s.first_name
            LIMIT ? OFFSET ?
        '''
        
        c.execute(query, params + [per_page, offset])
        students = c.fetchall()
        
        return jsonify({
            'students': [dict(s) for s in students],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()
