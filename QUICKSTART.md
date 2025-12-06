# Quick Start Guide

## Start the Application in 3 Steps

### Step 1: Start Backend
```bash
cd backend
pip install -r requirements.txt
python database.py
python app.py
```
✅ Backend running on `http://localhost:5000`

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
```
✅ Frontend running on `http://localhost:3000`

### Step 3: Login
Use these credentials:
- **Username:** kayla (or abigail, john)
- **Password:** any string

## What You Can Do

### 🔴 Stress Heatmap
View all students' stress levels at a glance. Green = calm, Red = stressed.

### 📊 Stress Trends
Line chart showing how stress levels change over time.

### 📋 Attendance Tracking
- See who's been absent
- Notification system for absent students
- Track attendance rates

### 📈 Grade Correlation
Analyze how attendance affects grades with interactive charts.

### 🚨 Alerts Dashboard
- Get notified when students report high stress (>7/10)
- Get notified when students report low sleep (<4 hours)
- Manually notify absent students

## Database

The application includes **20 sample students** with:
- ✅ 14 days of wellbeing data
- ✅ 14 days of attendance records
- ✅ 2 assignment grades per student

## Key Features for Staff

1. **Privacy First** - Only Kayla, Abigail, and John can see records
2. **Automatic Monitoring** - System alerts you to students in need
3. **Easy to Use** - Intuitive dashboard with clear visualizations
4. **Actionable Data** - See patterns and take action

## Architecture

```
Student fills survey → Backend records data → Dashboard shows alerts
                     ↓                      ↓
                  SQLite DB          Staff gets notified
                                        ↓
                                   Takes action
```

## API Overview

All API calls are protected by JWT. The frontend handles authentication automatically.

**Base URL:** `http://localhost:5000/api`

### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wellbeing/heatmap-data` | GET | Stress heatmap data |
| `/wellbeing/stress-over-time` | GET | Stress trends |
| `/attendance/absent-students` | GET | List of absent students |
| `/attendance/attendance-grades-correlation` | GET | Attendance vs grades |
| `/alerts/unread` | GET | New alerts |

## Customization

### Add More Students
Edit `backend/database.py` - change `range(1, 21)` to add more students.

### Change Alert Thresholds
Edit `backend/routes/alerts.py`:
```python
# Line: if (wr.stress_level > 7 or wr.sleep_level < 4)
# Change 7 to your stress threshold
# Change 4 to your sleep threshold
```

### Customize Colors
Edit `frontend/src/components/StressHeatmap.js`:
```javascript
// Modify the getColorForStress function
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to server" | Make sure backend is running on port 5000 |
| "Login fails" | Check username (kayla/abigail/john) is spelled correctly |
| "No data showing" | Run `python database.py` in backend folder |
| "Port 5000 in use" | Change port in `backend/app.py` line 35 |

## Next Steps

1. ✅ Login and explore the dashboard
2. ✅ Check the stress heatmap
3. ✅ View absent students list
4. ✅ Send notifications
5. ✅ Analyze the charts

---

Enjoy! 🎓📊
