# Visual Architecture & Data Flow Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      STUDENT WELLBEING PORTAL                   │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   (Port 3000)        │
                    │                      │
                    │ - Dashboard          │
                    │ - Charts             │
                    │ - Alerts             │
                    └──────────┬───────────┘
                               │
                        HTTP/HTTPS (CORS)
                               │
        ┌──────────────────────▼──────────────────────┐
        │                                              │
        │    Flask Backend API (Port 5000)            │
        │                                              │
        │  ┌────────────────────────────────────────┐ │
        │  │  Authentication                        │ │
        │  │  - Login/Register                      │ │
        │  │  - JWT Token Management                │ │
        │  │  - Role-Based Access Control (RBAC)    │ │
        │  └────────────────────────────────────────┘ │
        │                                              │
        │  ┌────────────────────────────────────────┐ │
        │  │  API Routes (25+ endpoints)            │ │
        │  │  ├─ /auth/* (Authentication)           │ │
        │  │  ├─ /wellbeing/* (Sleep, Stress)       │ │
        │  │  ├─ /attendance/* (Attendance)         │ │
        │  │  ├─ /grades/* (Academic)               │ │
        │  │  └─ /alerts/* (Notifications)          │ │
        │  └────────────────────────────────────────┘ │
        │                                              │
        └──────────────────────┬──────────────────────┘
                               │
                        SQL Queries
                               │
                    ┌──────────▼────────────┐
                    │   SQLite Database     │
                    │   (wellbeing.db)      │
                    │                       │
                    │  8 Tables:            │
                    │  - users              │
                    │  - students           │
                    │  - wellbeing_records  │
                    │  - attendance         │
                    │  - grades             │
                    │  - assignments        │
                    │  - alerts             │
                    │  - staff              │
                    └───────────────────────┘
```

---

## Data Flow Diagram

### Student Submits Wellbeing Survey

```
Student Survey Input
        ↓
 (Sleep: 6, Stress: 8, Mood: Stressed)
        ↓
   React Component
   (Frontend Form)
        ↓
   POST Request
   /api/wellbeing/record
        ↓
   Flask API
   (backend/routes/wellbeing.py)
        ↓
   Validate Data
        ↓
   Check Thresholds
   (Stress > 7? Sleep < 4?)
        ↓
   Insert to wellbeing_records
   table (SQLite)
        ↓
   System Checks
   (Auto-generate alerts)
        ↓
   Create Alert Entry
   (alerts table)
        ↓
   Response: 201 Created
        ↓
   Frontend Updates UI
        ↓
   Dashboard Shows New Alert
```

### Staff Views Dashboard & Receives Alert

```
Staff Logs In (kayla/abigail/john)
        ↓
   Credentials Verified
        ↓
   JWT Token Generated
   (Stored in localStorage)
        ↓
   Dashboard Loads
        ↓
   GET /api/alerts/unread
        ↓
   Backend Queries:
   SELECT * FROM alerts WHERE is_read = 0
        ↓
   Returns:
   [
     {
       "id": 1,
       "student_id": 5,
       "alert_type": "high_stress",
       "message": "Student has high stress...",
       "created_date": "2024-12-06T10:30:00"
     }
   ]
        ↓
   React Component Renders
   AlertsList
        ↓
   Staff Sees:
   ⚠️ Alert for Student John Doe
      "High Stress Level: 8.5/10"
   [Dismiss] [View Details]
        ↓
   Staff Takes Action
```

---

## Authentication & Access Control Flow

```
┌─────────────────────────────────────────────────────────┐
│              LOGIN FLOW (Authentication)                 │
└─────────────────────────────────────────────────────────┘

    Staff Member Enters Credentials
    (username: "kayla", password: "***")
            ↓
    Frontend POST /auth/login
            ↓
    Flask Backend Receives Request
            ↓
    Hash & Compare Password
            ↓
    Query: SELECT * FROM users WHERE username = "kayla"
            ↓
    Password Match? ✓
            ↓
    Generate JWT Token (valid 30 days)
            ↓
    Response:
    {
      "access_token": "eyJhbGciOiJIUzI1...",
      "user_id": 1,
      "username": "kayla",
      "role": "staff"
    }
            ↓
    Frontend Stores Token in localStorage
            ↓
    All Future Requests Include:
    Authorization: Bearer eyJhbGciOiJIUzI1...
            ↓
    Backend Verifies Token
            ↓
    @jwt_required() decorator checks token
            ↓
    If Valid: Process Request ✓
    If Invalid: Return 401 Unauthorized ✗

┌─────────────────────────────────────────────────────────┐
│        ROLE-BASED ACCESS CONTROL (RBAC)                 │
└─────────────────────────────────────────────────────────┘

User Role in Database
        ↓
    ├─ admin: Full access
    ├─ staff: Can view all student records
    └─ student: Can only view own records

Check Before Every Request:
    if role not in ["staff", "admin"]:
        return 403 Forbidden
    
    GET /api/wellbeing/records/5  ← Can access any student
    Status: 200 OK ✓
```

---

## Database Relationships

```
┌─────────────────────────────────────────────────┐
│                   DATABASE SCHEMA               │
└─────────────────────────────────────────────────┘

USERS (Authentication)
├─ id (PK)
├─ username
├─ password (hashed)
├─ email
├─ role
└─ created_at

     ↓ (1:1)

STUDENTS
├─ id (PK)
├─ user_id (FK → USERS)
├─ student_id (unique)
├─ first_name
├─ last_name
├─ email
└─ enrolled_date

     ↓ (1:Many)

WELLBEING_RECORDS
├─ id (PK)
├─ student_id (FK → STUDENTS)
├─ sleep_level (0-10)
├─ stress_level (0-10)
├─ mood
├─ mental_health_notes
└─ recorded_date

ATTENDANCE
├─ id (PK)
├─ student_id (FK → STUDENTS)
├─ class_date
├─ present (boolean)
└─ recorded_date

GRADES
├─ id (PK)
├─ student_id (FK → STUDENTS)
├─ assignment_id (FK → ASSIGNMENTS)
├─ grade
├─ feedback
└─ graded_date

ASSIGNMENTS
├─ id (PK)
├─ title
├─ description
├─ due_date
└─ created_date

ALERTS
├─ id (PK)
├─ student_id (FK → STUDENTS)
├─ alert_type
├─ message
├─ is_read (boolean)
└─ created_date

STAFF
├─ id (PK)
├─ user_id (FK → USERS)
├─ staff_name
├─ role
├─ can_view_records (boolean)
└─ created_at
```

---

## Frontend Component Hierarchy

```
App.js (Root Component)
│
├─ Router Setup
│  ├─ <Login /> (unauthenticated)
│  └─ <Dashboard /> (authenticated)
│
└─ Context / State Management
   ├─ Authentication State
   │  └─ User Token, Role, Username
   │
   └─ Dashboard
      ├─ State: activeTab (overview|wellbeing|attendance|analytics|alerts)
      │
      ├─ <Header> (user info, logout button)
      │
      ├─ <Navigation> (5 tabs)
      │  ├─ Overview
      │  ├─ Wellbeing
      │  ├─ Attendance
      │  ├─ Analytics
      │  └─ Alerts
      │
      └─ Tab Content:
         │
         ├─ Overview Tab
         │  ├─ <SummaryCards/> (4 cards with KPIs)
         │  └─ <AlertsList/>
         │
         ├─ Wellbeing Tab
         │  ├─ <StressHeatmap/>
         │  │  └─ Grid of colored cells per student
         │  └─ <StressOverTimeChart/>
         │     └─ LineChart (Recharts)
         │
         ├─ Attendance Tab
         │  └─ <AbsentStudents/>
         │     ├─ List of absent students
         │     └─ [Notify] buttons
         │
         ├─ Analytics Tab
         │  └─ <AttendanceGradesChart/>
         │     └─ Dual-axis LineChart
         │
         └─ Alerts Tab
            └─ <AlertsList/>
               └─ Alert items with [Dismiss] buttons
```

---

## API Request/Response Flow

```
┌────────────────────────────────────────────────┐
│     EXAMPLE: Get Absent Students               │
└────────────────────────────────────────────────┘

FRONTEND REQUEST:
─────────────────
GET http://localhost:5000/api/attendance/absent-students?days=30&threshold=0.8
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1...",
  "Content-Type": "application/json"
}

BACKEND PROCESSING:
──────────────────
1. @jwt_required() - Verify token ✓
2. Parse query params (days=30, threshold=0.8)
3. SQL Query:
   SELECT s.id, s.first_name, s.last_name, s.student_id,
          COUNT(CASE WHEN a.present = 1 THEN 1 END) as present_count,
          COUNT(*) as total_classes,
          (present_count / total_classes) as attendance_rate
   FROM students s
   LEFT JOIN attendance a ON s.id = a.student_id
   WHERE a.class_date >= date('now', '-30 days')
   GROUP BY s.id
   HAVING attendance_rate < 0.8
   ORDER BY attendance_rate ASC

4. Convert results to JSON
5. Return with status 200

FRONTEND RESPONSE:
──────────────────
Status: 200 OK
Body: [
  {
    "id": 7,
    "first_name": "Jane",
    "last_name": "Smith",
    "student_id": "STU1007",
    "present_count": 8,
    "total_classes": 14,
    "attendance_rate": 0.571
  },
  {
    "id": 12,
    "first_name": "Bob",
    "last_name": "Johnson",
    "student_id": "STU1012",
    "present_count": 10,
    "total_classes": 14,
    "attendance_rate": 0.714
  }
]

FRONTEND RENDERING:
───────────────────
map(students) → 
  <StudentCard>
    ├─ Name: Jane Smith (STU1007)
    ├─ Present: 8/14 (57.1%)
    └─ [Notify] button (sends POST /alerts/create)
```

---

## Alert Generation Flow

```
AUTOMATIC ALERT GENERATION
───────────────────────────

Step 1: Student Reports Wellbeing Data
   POST /wellbeing/record
   { "student_id": 5, "stress_level": 8, "sleep_level": 3 }
              ↓

Step 2: Backend Checks Thresholds
   if stress_level > 7:
      alert_type = "high_stress"
   if sleep_level < 4:
      alert_type = "low_sleep"
              ↓

Step 3: Check for Duplicate Recent Alerts
   SELECT * FROM alerts
   WHERE student_id = 5
   AND created_date > datetime('now', '-1 day')
   AND is_read = 0
              ↓

Step 4: Create Alert Entry
   INSERT INTO alerts (student_id, alert_type, message)
   VALUES (5, "high_stress", "Student has high stress levels: 8/10")
              ↓

Step 5: Frontend Fetch Unread Alerts
   GET /api/alerts/unread
              ↓

Step 6: Display in Dashboard
   <Alert>
     ⚠️ Student Name
        "Student has high stress levels: 8/10"
        [Dismiss]
              ↓

Step 7: Staff Dismisses Alert
   PUT /alerts/mark-read/1
              ↓

Step 8: Update Database
   UPDATE alerts SET is_read = 1 WHERE id = 1
              ↓

Step 9: Alert Removed from Dashboard
```

---

## Data Visualization Pipeline

```
┌─────────────────────────────────────────────┐
│          STRESS HEATMAP FLOW                 │
└─────────────────────────────────────────────┘

Backend Query:
SELECT s.id, s.first_name, s.last_name,
       AVG(wr.stress_level) as avg_stress
FROM students s
LEFT JOIN wellbeing_records wr ON s.id = wr.student_id
WHERE wr.recorded_date >= datetime('now', '-30 days')
GROUP BY s.id

Returns:
[
  {"id": 1, "first_name": "John", "last_name": "Doe", "avg_stress": 6.5},
  {"id": 2, "first_name": "Jane", "last_name": "Smith", "avg_stress": 8.2},
  {"id": 3, "first_name": "Bob", "last_name": "Johnson", "avg_stress": 3.1},
  ...
]
        ↓
Frontend Processes:
getColorForStress(avgStress):
  if avgStress >= 8: return RED (#d32f2f)
  if avgStress >= 6: return ORANGE (#f57c00)
  if avgStress >= 4: return YELLOW (#fbc02d)
  else: return GREEN (#388e3c)
        ↓
Renders Grid:
┌──────┬──────┬──────┐
│ John │ Jane │ Bob  │
│ 6.5  │ 8.2  │ 3.1  │
│ 🟠   │ 🔴   │ 🟢   │
└──────┴──────┴──────┘

User Hovers:
"Jane Smith: Stress 8.2 (Very High)"
```

---

## Deployment Architecture (Production)

```
┌────────────────────────────────────────────────────────┐
│              PRODUCTION ENVIRONMENT                    │
└────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │  CloudFlare CDN  │
                    │  (Static Assets) │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────┐          ┌────▼────┐         ┌────▼────┐
    │Nginx    │          │Nginx    │         │Nginx    │
    │Port 443 │          │Port 443 │         │Port 443 │
    │(SSL)    │          │(SSL)    │         │(SSL)    │
    └────┬────┘          └────┬────┘         └────┬────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                      ┌───────▼───────┐
                      │Load Balancer  │
                      └───────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐           ┌────▼────┐          ┌────▼────┐
    │Flask    │           │Flask    │          │Flask    │
    │Server 1 │           │Server 2 │          │Server N │
    │:5000    │           │:5000    │          │:5000    │
    └────┬────┘           └────┬────┘          └────┬────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                      ┌────────▼────────┐
                      │PostgreSQL DB    │
                      │(Primary)        │
                      └────────┬────────┘
                               │
                      ┌────────▼────────┐
                      │PostgreSQL DB    │
                      │(Replica)        │
                      └─────────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────┐
│           SECURITY LAYERS                      │
└────────────────────────────────────────────────┘

Layer 1: HTTPS/SSL
  └─ All data encrypted in transit
  └─ Certificate: Let's Encrypt
  └─ TLS 1.3

Layer 2: Authentication
  └─ Username + Password
  └─ Password Hashing: bcrypt
  └─ JWT Token (30-day expiry)

Layer 3: Authorization
  └─ Role-Based Access Control
  └─ @jwt_required() decorators
  └─ Check user role before data access

Layer 4: Input Validation
  └─ Validate all request data
  └─ SQL injection prevention
  └─ XSS protection

Layer 5: Rate Limiting
  └─ 100 requests per minute (per IP)
  └─ Prevents brute force attacks

Layer 6: Audit Logging
  └─ All data access logged
  └─ Timestamp, user, action recorded
  └─ GDPR/HIPAA compliance

Layer 7: Data Privacy
  └─ Only authorized staff: Kayla, Abigail, John
  └─ Field-level encryption (optional)
  └─ GDPR data deletion ready
```

---

This visual guide helps understand the complete system architecture and data flows!

---

**Last Updated:** December 2024
