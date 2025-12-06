from flask import Blueprint, jsonify, request
from database import get_db_connection

bp = Blueprint('grades', __name__, url_prefix='/api/grades')

@bp.route('/record', methods=['POST'])
def record_grade():
    """Record a grade for a student"""
    data = request.get_json()
    
    if not data or not data.get('student_id') or not data.get('assignment_id') or not data.get('grade'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO grades (student_id, assignment_id, grade, feedback) 
                 VALUES (?, ?, ?, ?)''',
              (data['student_id'], data['assignment_id'], data['grade'], data.get('feedback')))
    
    conn.commit()
    grade_id = c.lastrowid
    conn.close()
    
    return jsonify({'message': 'Grade recorded', 'grade_id': grade_id}), 201

@bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_grades(student_id):
    """Get all grades for a student"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT g.id, g.grade, g.feedback, g.graded_date,
                 a.title as assignment_title, a.due_date
                 FROM grades g
                 JOIN assignments a ON g.assignment_id = a.id
                 WHERE g.student_id = ?
                 ORDER BY g.graded_date DESC''',
              (student_id,))
    
    grades = c.fetchall()
    conn.close()
    
    return jsonify([dict(g) for g in grades]), 200

@bp.route('/assignment/<int:assignment_id>', methods=['GET'])
def get_assignment_grades(assignment_id):
    """Get all grades for an assignment"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT g.id, g.student_id, g.grade, g.feedback,
                 s.first_name, s.last_name, s.student_id as sid
                 FROM grades g
                 JOIN students s ON g.student_id = s.id
                 WHERE g.assignment_id = ?
                 ORDER BY g.grade DESC''',
              (assignment_id,))
    
    grades = c.fetchall()
    conn.close()
    
    return jsonify([dict(g) for g in grades]), 200

@bp.route('/statistics', methods=['GET'])
def get_grade_statistics():
    """Get statistics about grades"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT 
                 AVG(g.grade) as class_average,
                 MIN(g.grade) as min_grade,
                 MAX(g.grade) as max_grade,
                 COUNT(DISTINCT g.student_id) as students_graded,
                 COUNT(*) as total_grades
                 FROM grades g''')
    
    stats = c.fetchone()
    conn.close()
    
    return jsonify(dict(stats)), 200

@bp.route('/performance-by-attendance', methods=['GET'])
def get_performance_by_attendance():
    """Correlate grades with attendance"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT s.id, s.first_name, s.last_name,
                 AVG(g.grade) as avg_grade,
                 CAST(COUNT(CASE WHEN a.present = 1 THEN 1 END) AS FLOAT) / 
                    NULLIF(COUNT(*), 0) as attendance_rate,
                 COUNT(DISTINCT a.id) as total_attendance_records
                 FROM students s
                 LEFT JOIN grades g ON s.id = g.student_id
                 LEFT JOIN attendance a ON s.id = a.student_id
                 GROUP BY s.id
                 ORDER BY avg_grade DESC''')
    
    data = c.fetchall()
    conn.close()
    
    return jsonify([dict(d) for d in data]), 200
