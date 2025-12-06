from flask import Blueprint, jsonify, request
from database import get_db_connection

bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

@bp.route('/create', methods=['POST'])
def create_alert():
    """Create an alert for a student"""
    data = request.get_json()
    
    if not data or not data.get('student_id') or not data.get('alert_type') or not data.get('message'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO alerts (student_id, alert_type, message) 
                 VALUES (?, ?, ?)''',
              (data['student_id'], data['alert_type'], data['message']))
    
    conn.commit()
    alert_id = c.lastrowid
    conn.close()
    
    return jsonify({'message': 'Alert created', 'alert_id': alert_id}), 201

@bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_alerts(student_id):
    """Get all alerts for a student"""
    include_read = request.args.get('include_read', False, type=bool)
    
    conn = get_db_connection()
    c = conn.cursor()
    
    if include_read:
        c.execute('''SELECT * FROM alerts 
                     WHERE student_id = ?
                     ORDER BY created_date DESC''',
                  (student_id,))
    else:
        c.execute('''SELECT * FROM alerts 
                     WHERE student_id = ? AND is_read = 0
                     ORDER BY created_date DESC''',
                  (student_id,))
    
    alerts = c.fetchall()
    conn.close()
    
    return jsonify([dict(a) for a in alerts]), 200

@bp.route('/unread', methods=['GET'])
def get_unread_alerts():
    """Get all unread alerts for staff"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT a.id, a.student_id, a.alert_type, a.message, a.created_date,
                 s.first_name, s.last_name, s.student_id as sid
                 FROM alerts a
                 JOIN students s ON a.student_id = s.id
                 WHERE a.is_read = 0
                 ORDER BY a.created_date DESC''')
    
    alerts = c.fetchall()
    conn.close()
    
    return jsonify([dict(a) for a in alerts]), 200

@bp.route('/mark-read/<int:alert_id>', methods=['PUT'])
def mark_alert_read(alert_id):
    """Mark an alert as read"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''UPDATE alerts SET is_read = 1 WHERE id = ?''', (alert_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Alert marked as read'}), 200

@bp.route('/check-wellbeing', methods=['GET'])
def check_wellbeing_alerts():
    """Check for students needing alerts based on wellbeing data"""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Find students with high stress or low sleep in last 7 days
    c.execute('''SELECT DISTINCT s.id, s.first_name, s.last_name,
                 wr.stress_level, wr.sleep_level, wr.recorded_date
                 FROM students s
                 JOIN wellbeing_records wr ON s.id = wr.student_id
                 WHERE (wr.stress_level > 7 OR wr.sleep_level < 4)
                 AND wr.recorded_date >= datetime('now', '-7 days')
                 AND NOT EXISTS (
                     SELECT 1 FROM alerts a 
                     WHERE a.student_id = s.id 
                     AND a.is_read = 0
                     AND a.created_date >= datetime('now', '-1 day')
                 )
                 ORDER BY wr.recorded_date DESC''')
    
    students = c.fetchall()
    
    # Create alerts for these students
    for student in students:
        alert_type = 'high_stress' if student['stress_level'] > 7 else 'low_sleep'
        message = f"Student {student['first_name']} has {'high stress levels' if alert_type == 'high_stress' else 'low sleep levels'}"
        
        c.execute('''INSERT INTO alerts (student_id, alert_type, message) 
                     VALUES (?, ?, ?)''',
                  (student['id'], alert_type, message))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'alerts_created': len(students),
        'students': [dict(s) for s in students]
    }), 200
