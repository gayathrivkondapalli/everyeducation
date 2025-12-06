from flask import Blueprint, jsonify, request
from database import get_db_connection

bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

@bp.route('/record', methods=['POST'])
def record_attendance():
    """Record attendance for a student"""
    data = request.get_json()
    
    if not data or not data.get('student_id') or not data.get('class_date'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO attendance (student_id, class_date, present) 
                 VALUES (?, ?, ?)''',
              (data['student_id'], data['class_date'], data.get('present', True)))
    
    conn.commit()
    record_id = c.lastrowid
    conn.close()
    
    return jsonify({'message': 'Attendance recorded', 'record_id': record_id}), 201

@bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_attendance(student_id):
    """Get attendance records for a student"""
    days = request.args.get('days', 30, type=int)
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT * FROM attendance 
                 WHERE student_id = ?
                 AND class_date >= date('now', '-' || ? || ' days')
                 ORDER BY class_date DESC''',
              (student_id, days))
    
    records = c.fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in records]), 200

@bp.route('/absent-students', methods=['GET'])
def get_absent_students():
    """Get list of students who were absent"""
    days = request.args.get('days', 30, type=int)
    threshold = request.args.get('threshold', 0.8, type=float)  # Attendance threshold
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Get students with low attendance
    c.execute('''SELECT s.id, s.first_name, s.last_name, s.student_id,
                 COUNT(CASE WHEN a.present = 1 THEN 1 END) as present_count,
                 COUNT(*) as total_classes,
                 CAST(COUNT(CASE WHEN a.present = 1 THEN 1 END) AS FLOAT) / COUNT(*) as attendance_rate
                 FROM students s
                 LEFT JOIN attendance a ON s.id = a.student_id
                 WHERE a.class_date >= date('now', '-' || ? || ' days')
                 GROUP BY s.id
                 HAVING attendance_rate < ?
                 ORDER BY attendance_rate ASC''',
              (days, threshold))
    
    students = c.fetchall()
    conn.close()
    
    return jsonify([dict(s) for s in students]), 200

@bp.route('/attendance-grades-correlation', methods=['GET'])
def get_attendance_grades_correlation():
    """Get correlation between attendance and grades"""
    days = request.args.get('days', 30, type=int)
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT s.id, s.first_name, s.last_name,
                 COUNT(CASE WHEN a.present = 1 THEN 1 END) as present_count,
                 COUNT(*) as total_classes,
                 CAST(COUNT(CASE WHEN a.present = 1 THEN 1 END) AS FLOAT) / COUNT(*) as attendance_rate,
                 AVG(g.grade) as avg_grade,
                 MIN(g.grade) as min_grade,
                 MAX(g.grade) as max_grade
                 FROM students s
                 LEFT JOIN attendance a ON s.id = a.student_id
                 LEFT JOIN grades g ON s.id = g.student_id
                 WHERE a.class_date >= date('now', '-' || ? || ' days')
                 GROUP BY s.id
                 ORDER BY attendance_rate DESC''',
              (days,))
    
    data = c.fetchall()
    conn.close()
    
    return jsonify([dict(d) for d in data]), 200

@bp.route('/summary', methods=['GET'])
def get_attendance_summary():
    """Get attendance summary statistics"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT 
                 COUNT(DISTINCT student_id) as total_students,
                 COUNT(CASE WHEN present = 1 THEN 1 END) as total_present,
                 COUNT(CASE WHEN present = 0 THEN 1 END) as total_absent,
                 CAST(COUNT(CASE WHEN present = 1 THEN 1 END) AS FLOAT) / COUNT(*) as overall_attendance_rate
                 FROM attendance
                 WHERE class_date >= date('now', '-30 days')''')
    
    summary = c.fetchone()
    conn.close()
    
    return jsonify(dict(summary)), 200
