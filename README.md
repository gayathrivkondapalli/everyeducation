# Student Wellbeing & Attendance Tracking Portal

A comprehensive full-stack application for managing student wellbeing, attendance tracking, and performance analytics.

## Features

### 🎯 Core Features

1. **Student Wellbeing Management**
   - Sleep level tracking (0-10 scale)
   - Stress level monitoring (0-10 scale)
   - Mood tracking
   - Mental health notes
   - Heatmap visualization of stress levels across students

2. **Attendance Tracking**
   - Daily attendance recording
   - Absent student identification
   - Attendance rate calculation
   - Historical attendance records

3. **Academic Performance**
   - Grade recording and management
   - Assignment tracking
   - Performance analytics
   - Correlation analysis between attendance and grades

4. **Alerts & Notifications**
   - Automatic alerts for high stress levels (>7)
   - Automatic alerts for low sleep (<4 hours)
   - Low attendance notifications
   - Alert management dashboard

5. **Role-Based Access Control**
   - **Staff Only:** Kayla, Abigail, and John
   - Can view all student records
   - Can create and manage alerts
   - Can track attendance and grades

6. **Visualizations**
   - **Stress Heatmap:** Color-coded visualization of student stress levels
   - **Stress Over Time:** Line chart showing stress trends
   - **Attendance vs Grades:** Correlation analysis chart
   - **Summary Dashboard:** Key metrics and statistics

## Tech Stack

### Backend
- **Framework:** Flask 2.3.0
- **Database:** SQLite
- **Authentication:** JWT (Flask-JWT-Extended)
- **CORS:** Flask-CORS for cross-origin requests
- **Language:** Python 3.8+

### Frontend
- **Framework:** React 18.2.0
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charting:** Recharts
- **Styling:** CSS3

## Project Structure

```
Portal/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── database.py            # Database initialization and schema
│   ├── requirements.txt       # Python dependencies
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── wellbeing.py      # Wellbeing data endpoints
│   │   ├── attendance.py     # Attendance endpoints
│   │   ├── grades.py         # Grades endpoints
│   │   └── alerts.py         # Alerts endpoints
│   ├── models/               # Data models (if needed)
│   └── utils/                # Utility functions
├── frontend/
│   ├── package.json          # Node dependencies
│   ├── public/
│   │   └── index.html        # Main HTML file
│   ├── src/
│   │   ├── App.js            # Root component
│   │   ├── index.js          # React entry point
│   │   ├── pages/
│   │   │   ├── Login.js      # Login page
│   │   │   └── Dashboard.js  # Main dashboard
│   │   ├── components/
│   │   │   ├── StressChart.js
│   │   │   ├── StressHeatmap.js
│   │   │   ├── AttendanceGradesChart.js
│   │   │   ├── AbsentStudents.js
│   │   │   └── Alerts.js
│   │   ├── styles/           # CSS stylesheets
│   │   └── utils/
│   │       └── api.js        # API client configuration
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (optional):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database with sample data:**
   ```bash
   python database.py
   ```

5. **Start the backend server:**
   ```bash
   python app.py
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   Frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Wellbeing
- `POST /api/wellbeing/record` - Record wellbeing data
- `GET /api/wellbeing/records/<student_id>` - Get student wellbeing records
- `GET /api/wellbeing/alerts` - Get wellbeing alerts
- `GET /api/wellbeing/stress-over-time` - Get stress trend data
- `GET /api/wellbeing/heatmap-data` - Get heatmap visualization data

### Attendance
- `POST /api/attendance/record` - Record attendance
- `GET /api/attendance/student/<student_id>` - Get student attendance
- `GET /api/attendance/absent-students` - Get absent students list
- `GET /api/attendance/attendance-grades-correlation` - Get correlation data
- `GET /api/attendance/summary` - Get attendance summary

### Grades
- `POST /api/grades/record` - Record grade
- `GET /api/grades/student/<student_id>` - Get student grades
- `GET /api/grades/assignment/<assignment_id>` - Get assignment grades
- `GET /api/grades/statistics` - Get grade statistics
- `GET /api/grades/performance-by-attendance` - Get performance analytics

### Alerts
- `POST /api/alerts/create` - Create alert
- `GET /api/alerts/student/<student_id>` - Get student alerts
- `GET /api/alerts/unread` - Get unread alerts
- `PUT /api/alerts/mark-read/<alert_id>` - Mark alert as read
- `POST /api/alerts/check-wellbeing` - Check wellbeing and create alerts

## Demo Credentials

### Staff Members (with full access)
- **Username:** kayla | **Password:** any
- **Username:** abigail | **Password:** any
- **Username:** john | **Password:** any

Sample data includes 20 students with 2 weeks of:
- Wellbeing records
- Attendance records
- Grade assignments

## Usage Guide

### For Staff/Course Leads

1. **Login** with your credentials (kayla, abigail, or john)

2. **Dashboard Overview**
   - View summary statistics
   - Check recent alerts
   - See overall attendance rate

3. **Wellbeing Tab**
   - View stress heatmap showing all students
   - Monitor individual stress trends
   - Identify students needing support

4. **Attendance Tab**
   - View list of absent students
   - Check attendance rates
   - Send notifications to absent students

5. **Analytics Tab**
   - Analyze correlation between attendance and grades
   - Identify at-risk students
   - Track performance trends

6. **Alerts Tab**
   - View all wellbeing alerts
   - See high stress and low sleep notifications
   - Dismiss alerts after follow-up

## Key Capabilities

### ✅ Student Data Privacy
- Role-based access control
- Only authorized staff can view records
- Secure JWT authentication
- Data stored in local SQLite database

### ✅ Automated Alerts
- Automatic detection of high stress (>7/10)
- Automatic detection of low sleep (<4 hours)
- Manual notification system for absent students
- Alert history and tracking

### ✅ Data Visualization
- **Heatmap:** Color-coded stress levels (Green → Red)
- **Line Charts:** Stress and performance trends over time
- **Correlation Charts:** Attendance vs grades relationship
- **Summary Cards:** Key metrics at a glance

### ✅ Reporting
- Student wellbeing reports
- Attendance reports
- Performance correlation analysis
- Alert history

## Database Schema

### Users Table
- id, username, password, email, role, created_at

### Students Table
- id, user_id, student_id, first_name, last_name, email, enrolled_date

### Wellbeing Records
- id, student_id, sleep_level, stress_level, mood, mental_health_notes, recorded_date

### Attendance
- id, student_id, class_date, present, recorded_date

### Grades
- id, student_id, assignment_id, grade, feedback, submitted_date, graded_date

### Alerts
- id, student_id, alert_type, message, is_read, created_date

### Assignments
- id, title, description, due_date, created_date

## Configuration

### Backend Configuration
Edit `app.py` to change:
- `JWT_SECRET_KEY` - Change from default (important for production)
- `JWT_ACCESS_TOKEN_EXPIRES` - Token expiration time
- Port: 5000 (change in `app.run()`)

### Frontend Configuration
Edit `frontend/src/utils/api.js` to change:
- `API_BASE_URL` - Backend API URL

## Troubleshooting

### Backend Issues

**Database not initializing:**
```bash
cd backend
rm wellbeing.db  # Delete existing database
python database.py  # Reinitialize
```

**Port already in use:**
```python
# In app.py, change the port:
app.run(debug=True, port=5001)  # Use different port
```

### Frontend Issues

**Cannot connect to backend:**
- Ensure backend is running on port 5000
- Check CORS settings in `app.py`
- Verify API URL in `frontend/src/utils/api.js`

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Performance Notes

- Database uses SQLite (suitable for up to ~1000 concurrent users)
- For production, migrate to PostgreSQL
- Implement pagination for large datasets
- Add caching for frequently accessed data

## Security Considerations

⚠️ **Important for Production:**

1. Change `JWT_SECRET_KEY` in `app.py`
2. Implement proper password hashing (bcrypt)
3. Add HTTPS/SSL encryption
4. Implement rate limiting
5. Add input validation and sanitization
6. Use environment variables for secrets
7. Implement audit logging
8. Add CSRF protection
9. Consider database encryption

## Future Enhancements

- [ ] Email notifications to staff and students
- [ ] SMS alerts for critical situations
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and ML predictions
- [ ] Integration with university systems
- [ ] Parent/guardian notifications
- [ ] Intervention recommendation system
- [ ] Multi-language support

## Support & Contact

For issues or questions, contact the wellbeing team through the dashboard alerts system.

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

**Last Updated:** December 2024
**Version:** 1.0.0
