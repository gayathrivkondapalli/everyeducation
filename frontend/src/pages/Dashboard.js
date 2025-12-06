import React, { useState, useEffect } from 'react';
import StudentDashboard from './StudentDashboard';
import CourseLeadDashboard from './CourseLeadDashboard';
import WellbeingOfficerDashboard from './WellbeingOfficerDashboard';
import StressHeatmap from '../components/StressHeatmap';
import StressOverTimeChart from '../components/StressChart';
import AttendanceGradesChart from '../components/AttendanceGradesChart';
import AbsentStudents from '../components/AbsentStudents';
import AlertsList from '../components/Alerts';
import { attendanceAPI } from '../utils/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const role = localStorage.getItem('role');

  // Route to role-specific dashboard
  if (role === 'student') {
    return <StudentDashboard />;
  }
  
  if (role === 'course_lead') {
    return <CourseLeadDashboard />;
  }
  
  if (role === 'wellbeing_officer') {
    return <WellbeingOfficerDashboard />;
  }

  // Default staff dashboard (for kayla, abigail, john who are 'staff')
  return <StaffDashboard />;
};

// Original staff dashboard for backwards compatibility
const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await attendanceAPI.getAttendanceSummary();
        setSummary(response.data);
      } catch (err) {
        console.error('Failed to fetch summary', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Student Wellbeing & Attendance Portal</h1>
        <div className="user-info">
          <span>{username}</span>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-btn ${activeTab === 'wellbeing' ? 'active' : ''}`}
          onClick={() => setActiveTab('wellbeing')}
        >
          Wellbeing
        </button>
        <button
          className={`nav-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
        </button>
      </nav>

      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <section className="tab-content">
            <h2>Dashboard Overview</h2>
            {loading ? (
              <p>Loading...</p>
            ) : summary ? (
              <div className="summary-cards">
                <div className="summary-card">
                  <h3>Total Students</h3>
                  <p className="stat-number">{summary.total_students || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Classes Attended</h3>
                  <p className="stat-number">{summary.total_present || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Absences</h3>
                  <p className="stat-number">{summary.total_absent || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Overall Attendance</h3>
                  <p className="stat-number">
                    {(summary.overall_attendance_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : null}
            <hr />
            <AlertsList />
          </section>
        )}

        {/* Wellbeing Tab */}
        {activeTab === 'wellbeing' && (
          <section className="tab-content">
            <h2>Student Wellbeing</h2>
            <StressHeatmap />
            <hr />
            <StressOverTimeChart days={30} />
          </section>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <section className="tab-content">
            <h2>Attendance Management</h2>
            <AbsentStudents threshold={0.8} days={30} />
          </section>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <section className="tab-content">
            <h2>Performance Analytics</h2>
            <AttendanceGradesChart days={30} />
          </section>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <section className="tab-content">
            <h2>Notifications & Alerts</h2>
            <AlertsList />
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;