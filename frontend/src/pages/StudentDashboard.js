import React, { useState } from 'react';
import WellbeingSurvey from '../components/WellbeingSurvey';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const username = localStorage.getItem('username');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Every Education</h1>
        <div className="user-info">
          <span className="user-badge student-badge">Student</span>
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
          className={`nav-btn ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          📝 Daily Check-in
        </button>
        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 My History
        </button>
        <button
          className={`nav-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          💚 Resources
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'checkin' && (
          <section className="tab-content">
            <WellbeingSurvey />
          </section>
        )}

        {activeTab === 'history' && (
          <section className="tab-content">
            <div className="history-section">
              <h2>Your Wellbeing History</h2>
              <p className="coming-soon">📈 Your personal wellbeing trends will appear here.</p>
              <div className="history-placeholder">
                <div className="placeholder-card">
                  <h3>Last 7 Days</h3>
                  <p>Average Sleep: 7/10</p>
                  <p>Average Stress: 4/10</p>
                  <p>Most Common Mood: 😊 Happy</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'resources' && (
          <section className="tab-content">
            <div className="resources-section">
              <h2>Wellbeing Resources</h2>
              <div className="resources-grid">
                <div className="resource-card">
                  <div className="resource-icon">🧘</div>
                  <h3>Stress Management</h3>
                  <p>Tips and techniques to manage stress effectively.</p>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">😴</div>
                  <h3>Sleep Better</h3>
                  <p>Improve your sleep quality with these strategies.</p>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">🏃</div>
                  <h3>Stay Active</h3>
                  <p>Physical activity tips for busy students.</p>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">🗣️</div>
                  <h3>Talk to Someone</h3>
                  <p>Contact our wellbeing officers for support.</p>
                </div>
              </div>
              <div className="emergency-contact">
                <h3>🆘 Need Immediate Help?</h3>
                <p>If you're in crisis, please contact:</p>
                <ul>
                  <li>University Wellbeing Team: ext. 1234</li>
                  <li>Student Support: support@university.edu</li>
                  <li>Emergency Services: 999</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
