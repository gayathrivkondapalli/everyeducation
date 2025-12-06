# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require JWT token in header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "staff|student"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user_id": integer
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "access_token": "string",
  "user_id": integer,
  "username": "string",
  "role": "string"
}
```

---

## Wellbeing Endpoints

### Record Wellbeing Data
```
POST /wellbeing/record
Content-Type: application/json

{
  "student_id": integer,
  "sleep_level": integer (0-10),
  "stress_level": integer (0-10),
  "mood": "string",
  "notes": "string (optional)"
}

Response: 201 Created
{
  "message": "Wellbeing record created",
  "record_id": integer
}
```

### Get Student Wellbeing Records
```
GET /wellbeing/records/<student_id>?days=30

Query Parameters:
- days: integer (default: 30)

Response: 200 OK
[
  {
    "id": integer,
    "student_id": integer,
    "sleep_level": integer,
    "stress_level": integer,
    "mood": "string",
    "mental_health_notes": "string",
    "recorded_date": "ISO 8601 datetime"
  }
]
```

### Get Wellbeing Alerts
```
GET /wellbeing/alerts

Response: 200 OK
[
  {
    "id": integer,
    "first_name": "string",
    "last_name": "string",
    "stress_level": integer,
    "sleep_level": integer,
    "recorded_date": "ISO 8601 datetime"
  }
]
```

### Get Stress Over Time
```
GET /wellbeing/stress-over-time?student_id=1&days=30

Query Parameters:
- student_id: integer (optional, null for all students)
- days: integer (default: 30)

Response: 200 OK
[
  {
    "recorded_date": "ISO 8601 datetime",
    "stress_level": integer
  }
]
```

### Get Heatmap Data
```
GET /wellbeing/heatmap-data

Response: 200 OK
[
  {
    "id": integer,
    "first_name": "string",
    "last_name": "string",
    "avg_stress": float,
    "min_sleep": integer,
    "record_count": integer
  }
]
```

---

## Attendance Endpoints

### Record Attendance
```
POST /attendance/record
Content-Type: application/json

{
  "student_id": integer,
  "class_date": "YYYY-MM-DD",
  "present": boolean (default: true)
}

Response: 201 Created
{
  "message": "Attendance recorded",
  "record_id": integer
}
```

### Get Student Attendance
```
GET /attendance/student/<student_id>?days=30

Query Parameters:
- days: integer (default: 30)

Response: 200 OK
[
  {
    "id": integer,
    "student_id": integer,
    "class_date": "YYYY-MM-DD",
    "present": boolean,
    "recorded_date": "ISO 8601 datetime"
  }
]
```

### Get Absent Students
```
GET /attendance/absent-students?days=30&threshold=0.8

Query Parameters:
- days: integer (default: 30)
- threshold: float (default: 0.8, 80% attendance threshold)

Response: 200 OK
[
  {
    "id": integer,
    "first_name": "string",
    "last_name": "string",
    "student_id": "string",
    "present_count": integer,
    "total_classes": integer,
    "attendance_rate": float
  }
]
```

### Get Attendance-Grades Correlation
```
GET /attendance/attendance-grades-correlation?days=30

Query Parameters:
- days: integer (default: 30)

Response: 200 OK
[
  {
    "id": integer,
    "first_name": "string",
    "last_name": "string",
    "present_count": integer,
    "total_classes": integer,
    "attendance_rate": float,
    "avg_grade": float,
    "min_grade": float,
    "max_grade": float
  }
]
```

### Get Attendance Summary
```
GET /attendance/summary

Response: 200 OK
{
  "total_students": integer,
  "total_present": integer,
  "total_absent": integer,
  "overall_attendance_rate": float
}
```

---

## Grades Endpoints

### Record Grade
```
POST /grades/record
Content-Type: application/json

{
  "student_id": integer,
  "assignment_id": integer,
  "grade": float,
  "feedback": "string (optional)"
}

Response: 201 Created
{
  "message": "Grade recorded",
  "grade_id": integer
}
```

### Get Student Grades
```
GET /grades/student/<student_id>

Response: 200 OK
[
  {
    "id": integer,
    "grade": float,
    "feedback": "string",
    "graded_date": "ISO 8601 datetime",
    "assignment_title": "string",
    "due_date": "YYYY-MM-DD"
  }
]
```

### Get Assignment Grades
```
GET /grades/assignment/<assignment_id>

Response: 200 OK
[
  {
    "id": integer,
    "student_id": integer,
    "grade": float,
    "feedback": "string",
    "first_name": "string",
    "last_name": "string",
    "sid": "string"
  }
]
```

### Get Grade Statistics
```
GET /grades/statistics

Response: 200 OK
{
  "class_average": float,
  "min_grade": float,
  "max_grade": float,
  "students_graded": integer,
  "total_grades": integer
}
```

### Get Performance by Attendance
```
GET /grades/performance-by-attendance

Response: 200 OK
[
  {
    "id": integer,
    "first_name": "string",
    "last_name": "string",
    "avg_grade": float,
    "attendance_rate": float,
    "total_attendance_records": integer
  }
]
```

---

## Alerts Endpoints

### Create Alert
```
POST /alerts/create
Content-Type: application/json

{
  "student_id": integer,
  "alert_type": "high_stress|low_sleep|low_attendance|other",
  "message": "string"
}

Response: 201 Created
{
  "message": "Alert created",
  "alert_id": integer
}
```

### Get Student Alerts
```
GET /alerts/student/<student_id>?include_read=false

Query Parameters:
- include_read: boolean (default: false)

Response: 200 OK
[
  {
    "id": integer,
    "student_id": integer,
    "alert_type": "string",
    "message": "string",
    "is_read": boolean,
    "created_date": "ISO 8601 datetime"
  }
]
```

### Get Unread Alerts
```
GET /alerts/unread

Response: 200 OK
[
  {
    "id": integer,
    "student_id": integer,
    "alert_type": "string",
    "message": "string",
    "created_date": "ISO 8601 datetime",
    "first_name": "string",
    "last_name": "string",
    "sid": "string"
  }
]
```

### Mark Alert as Read
```
PUT /alerts/mark-read/<alert_id>

Response: 200 OK
{
  "message": "Alert marked as read"
}
```

### Check Wellbeing and Create Alerts
```
POST /alerts/check-wellbeing

Response: 200 OK
{
  "alerts_created": integer,
  "students": [
    {
      "id": integer,
      "first_name": "string",
      "last_name": "string",
      "stress_level": integer,
      "sleep_level": integer,
      "recorded_date": "ISO 8601 datetime"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid username or password"
}
```

### 404 Not Found
```json
{
  "error": "Not found"
}
```

### 409 Conflict
```json
{
  "error": "Username or email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Examples

### Example 1: Login and Get Unread Alerts

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"kayla","password":"test123"}'

# Response:
# {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user_id":1,"username":"kayla","role":"staff"}

# Get unread alerts
curl -X GET http://localhost:5000/api/alerts/unread \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 2: Get Stress Data and Heatmap

```bash
# Get heatmap data
curl -X GET http://localhost:5000/api/wellbeing/heatmap-data \
  -H "Authorization: Bearer <token>"

# Get stress over time for student 1
curl -X GET "http://localhost:5000/api/wellbeing/stress-over-time?student_id=1&days=14" \
  -H "Authorization: Bearer <token>"
```

### Example 3: Get Absent Students and Record Alert

```bash
# Get absent students
curl -X GET http://localhost:5000/api/attendance/absent-students \
  -H "Authorization: Bearer <token>"

# Create alert for absent student
curl -X POST http://localhost:5000/api/alerts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"student_id":1,"alert_type":"low_attendance","message":"Student has been absent from recent classes"}'
```

---

**Last Updated:** December 2024
