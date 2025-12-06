import React, { useState, useEffect } from 'react';
import AbsentStudents from '../components/AbsentStudents';
import AttendanceGradesChart from '../components/AttendanceGradesChart';
import AlertsList from '../components/Alerts';
import { attendanceAPI, alertsAPI } from '../utils/api';
import '../styles/Dashboard.css';

const CourseLeadDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [attendanceAlerts, setAttendanceAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, alertsRes] = await Promise.all([
          attendanceAPI.getAttendanceSummary(),
          alertsAPI.getUnreadAlerts()
        ]);
        setSummary(summaryRes.data);
        // Filter only attendance-related alerts
        const filtered = (alertsRes.data || []).filter(alert => 
          alert.alert_type === 'attendance' || 
          alert.alert_type === 'low_attendance' ||
          alert.message?.toLowerCase().includes('attendance') ||
          alert.message?.toLowerCase().includes('absent')
        );
        setAttendanceAlerts(filtered);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Course Lead Dashboard</h1>
        <div className="user-info">
          <span className="user-badge lead-badge">Course Lead</span>
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
          📊 Overview
        </button>
        <button
          className={`nav-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          📋 Attendance
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button
          className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 Alerts {attendanceAlerts.length > 0 && <span className="alert-count">{attendanceAlerts.length}</span>}
        </button>
      </nav>

      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <section className="tab-content">
            <h2>Attendance Overview</h2>
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
                  <p className="stat-number alert-stat">{summary.total_absent || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Overall Attendance</h3>
                  <p className="stat-number">
                    {(summary.overall_attendance_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : null}
            
            <div className="quick-alerts">
              <h3>⚠️ Attendance Alerts</h3>
              {attendanceAlerts.length > 0 ? (
                <ul className="alert-list">
                  {attendanceAlerts.slice(0, 5).map((alert, idx) => (
                    <li key={idx} className="alert-item attendance-alert">
                      <span className="alert-icon">📉</span>
                      <span>{alert.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-alerts">No attendance alerts at this time.</p>
              )}
            </div>
          </section>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <section className="tab-content">
            <h2>Students with Low Attendance</h2>
            <p className="tab-description">Students with attendance below 80% require attention.</p>
            <AbsentStudents threshold={0.8} days={30} />
          </section>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <section className="tab-content">
            <h2>Attendance & Performance Analytics</h2>
            <p className="tab-description">Correlation between attendance and academic performance.</p>
            <AttendanceGradesChart days={30} />
          </section>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <section className="tab-content">
            <h2>Attendance Alerts</h2>
            <p className="tab-description">Notifications about students with low attendance.</p>
            <AlertsList filterType="attendance" />
          </section>
        )}
      </main>
    </div>
  );
};

export default CourseLeadDashboard;
