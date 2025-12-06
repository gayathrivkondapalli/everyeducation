import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'wellbeing.db')

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with schema"""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Students table
    c.execute('''CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        student_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # Wellbeing data table
    c.execute('''CREATE TABLE IF NOT EXISTS wellbeing_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        sleep_level INTEGER,
        stress_level INTEGER,
        mood TEXT,
        mental_health_notes TEXT,
        recorded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
    )''')
    
    # Attendance table
    c.execute('''CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_date DATE NOT NULL,
        present BOOLEAN DEFAULT 1,
        recorded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
    )''')
    
    # Assignments table
    c.execute('''CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Grades table
    c.execute('''CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        assignment_id INTEGER NOT NULL,
        grade REAL NOT NULL,
        feedback TEXT,
        submitted_date TIMESTAMP,
        graded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    )''')
    
    # Alerts table
    c.execute('''CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
    )''')
    
    # Staff table
    c.execute('''CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        staff_name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT,
        can_view_records BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    conn.commit()
    conn.close()

def seed_sample_data():
    """Seed database with sample data for testing"""
    conn = get_db_connection()
    c = conn.cursor()
    
    try:
        # Add sample users with properly hashed passwords
        hashed_pw = generate_password_hash('password123')
        c.execute('''INSERT INTO users (username, password, email, role) 
                     VALUES (?, ?, ?, ?)''',
                  ('kayla', hashed_pw, 'kayla@university.edu', 'staff'))
        c.execute('''INSERT INTO users (username, password, email, role) 
                     VALUES (?, ?, ?, ?)''',
                  ('abigail', generate_password_hash('password123'), 'abigail@university.edu', 'staff'))
        c.execute('''INSERT INTO users (username, password, email, role) 
                     VALUES (?, ?, ?, ?)''',
                  ('john', generate_password_hash('password123'), 'john@university.edu', 'staff'))
        
        # Generate 30,000 students with random names
        import random
        
        first_names = [
            'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
            'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
            'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Sofia', 'Logan', 'Avery', 'Jackson',
            'Ella', 'Sebastian', 'Scarlett', 'Aiden', 'Grace', 'Matthew', 'Chloe', 'Samuel', 'Victoria', 'David',
            'Riley', 'Joseph', 'Aria', 'Carter', 'Lily', 'Owen', 'Aurora', 'Wyatt', 'Zoey', 'John',
            'Penelope', 'Jack', 'Layla', 'Luke', 'Nora', 'Jayden', 'Camila', 'Dylan', 'Hannah', 'Grayson',
            'Zoe', 'Levi', 'Lillian', 'Isaac', 'Addison', 'Gabriel', 'Eleanor', 'Julian', 'Natalie', 'Mateo',
            'Luna', 'Anthony', 'Savannah', 'Jaxon', 'Brooklyn', 'Lincoln', 'Leah', 'Joshua', 'Stella', 'Christopher',
            'Hazel', 'Andrew', 'Ellie', 'Theodore', 'Paisley', 'Caleb', 'Audrey', 'Ryan', 'Skylar', 'Asher',
            'Violet', 'Nathan', 'Claire', 'Thomas', 'Bella', 'Leo', 'Lucy', 'Isaiah', 'Anna', 'Charles'
        ]
        
        last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
            'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
            'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
            'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
            'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
            'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
            'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
            'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
        ]
        
        print("Adding 30,000 students...")
        students_data = []
        for i in range(1, 30001):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            email = f'{first_name.lower()}.{last_name.lower()}{i}@university.edu'
            students_data.append((f'STU{10000+i}', first_name, last_name, email))
        
        c.executemany('''INSERT INTO students (student_id, first_name, last_name, email) 
                         VALUES (?, ?, ?, ?)''', students_data)
        print("Students added.")
        
        # Add wellbeing records for a sample of students (not all 30K to keep DB manageable)
        print("Adding wellbeing records for sample students...")
        sample_students = random.sample(range(1, 30001), 500)  # Sample 500 students for detailed records
        
        for i in sample_students:
            for day in range(0, 14):
                stress = random.randint(1, 10)
                sleep = random.randint(3, 10)
                c.execute('''INSERT INTO wellbeing_records (student_id, sleep_level, stress_level, mood, recorded_date) 
                             VALUES (?, ?, ?, ?, datetime('now', '-' || ? || ' days'))''',
                          (i, sleep, stress, 
                           random.choice(['Happy', 'Neutral', 'Stressed', 'Anxious']), day))
                
                # Create alerts for high stress (>8) on recent days only (today or yesterday)
                if stress > 8 and day <= 1:
                    c.execute('''INSERT INTO alerts (student_id, alert_type, message, created_date)
                                 VALUES (?, 'high_stress', ?, datetime('now', '-' || ? || ' days'))''',
                              (i, f'High stress level ({stress}/10) reported. Immediate attention may be needed.', day))
                
                # Create alerts for low sleep (<=3) on recent days
                if sleep <= 3 and day <= 1:
                    c.execute('''INSERT INTO alerts (student_id, alert_type, message, created_date)
                                 VALUES (?, 'low_sleep', ?, datetime('now', '-' || ? || ' days'))''',
                              (i, f'Low sleep quality ({sleep}/10) reported. Student may need support.', day))
        print("Wellbeing records added.")
        
        # Add attendance records for sample students
        print("Adding attendance records...")
        student_attendance = {i: {'present': 0, 'total': 0} for i in sample_students}
        low_attendance_students = random.sample(sample_students, 50)  # 50 students with low attendance
        
        for i in sample_students:
            for day in range(0, 14):
                present = random.random() > 0.2  # 80% base attendance
                # Make some students have lower attendance (< 70%)
                if i in low_attendance_students:
                    present = random.random() > 0.5  # ~50% attendance
                c.execute('''INSERT INTO attendance (student_id, class_date, present) 
                             VALUES (?, date('now', '-' || ? || ' days'), ?)''',
                          (i, day, present))
                student_attendance[i]['total'] += 1
                if present:
                    student_attendance[i]['present'] += 1
        
        # Create low attendance alerts for students with < 70% attendance
        for student_id, data in student_attendance.items():
            if data['total'] > 0:
                rate = data['present'] / data['total']
                if rate < 0.70:
                    c.execute('''SELECT first_name, last_name FROM students WHERE id = ?''', (student_id,))
                    student = c.fetchone()
                    if student:
                        attendance_pct = round(rate * 100, 1)
                        c.execute('''INSERT INTO alerts (student_id, alert_type, message)
                                     VALUES (?, 'low_attendance', ?)''',
                                  (student_id, f'Low attendance ({attendance_pct}%) - below 70% threshold. Student {student[0]} {student[1]} requires intervention.'))
        print("Attendance records added.")
        
        # Add assignments
        c.execute('''INSERT INTO assignments (title, description, due_date) 
                     VALUES (?, ?, date('2024-12-20'))''',
                  ('Assignment 1', 'First assignment', ))
        c.execute('''INSERT INTO assignments (title, description, due_date) 
                     VALUES (?, ?, date('2024-12-27'))''',
                  ('Assignment 2', 'Second assignment', ))
        
        # Add grades for sample students
        print("Adding grades...")
        grades_data = []
        for i in sample_students:
            grade1 = random.randint(40, 100)
            grade2 = random.randint(40, 100)
            grades_data.append((i, 1, grade1))
            grades_data.append((i, 2, grade2))
        c.executemany('''INSERT INTO grades (student_id, assignment_id, grade) 
                         VALUES (?, ?, ?)''', grades_data)
        
        conn.commit()
        print("Sample data seeded successfully with 30,000 students!")
    except sqlite3.IntegrityError:
        print("Sample data already exists")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    seed_sample_data()
