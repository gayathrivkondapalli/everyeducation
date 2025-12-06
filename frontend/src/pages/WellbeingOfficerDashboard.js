import React, { useState } from 'react';
import StressHeatmap from '../components/StressHeatmap';
import StressOverTimeChart from '../components/StressChart';
import StudentSearch from '../components/StudentSearch';
import SendHelp from '../components/SendHelp';
import AlertsList from '../components/Alerts';
import '../styles/Dashboard.css';

const WellbeingOfficerDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const username = localStorage.getItem('username');



  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Wellbeing Officer Dashboard</h1>
        <div className="user-info">
          <span className="user-badge officer-badge">Wellbeing Officer</span>
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
          className={`nav-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          🔍 Student Search
        </button>
        <button
          className={`nav-btn ${activeTab === 'wellbeing' ? 'active' : ''}`}
          onClick={() => setActiveTab('wellbeing')}
        >
          💚 Wellbeing
        </button>
        <button
          className={`nav-btn ${activeTab === 'sendhelp' ? 'active' : ''}`}
          onClick={() => setActiveTab('sendhelp')}
        >
          🆘 Send Help
        </button>
        <button
          className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 All Alerts
        </button>
      </nav>

      <main className="dashboard-content">
        {/* Student Search Tab */}
        {activeTab === 'students' && (
          <section className="tab-content">
            <h2>Individual Student Wellbeing</h2>
            <p className="tab-description">Search and view individual student stress levels, mood, and form completion status.</p>
            <StudentSearch />
          </section>
        )}

        {/* Wellbeing Tab */}
        {activeTab === 'wellbeing' && (
          <section className="tab-content">
            <h2>Student Wellbeing Monitor</h2>
            <p className="tab-description">Monitor student stress levels and identify those who may need support.</p>
            <StressHeatmap />
            <hr />
            <h3>Stress Trends Over Time</h3>
            <StressOverTimeChart days={30} />
          </section>
        )}

        {/* Send Help Tab */}
        {activeTab === 'sendhelp' && (
          <section className="tab-content">
            <h2>Send Help to Stressed Students</h2>
            <p className="tab-description">Reach out to students showing high stress or concerning moods with a support message.</p>
            <SendHelp />
          </section>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <section className="tab-content">
            <h2>Stress & Wellbeing Alerts</h2>
            <p className="tab-description">Alerts for students with high stress levels or low sleep quality.</p>
            <AlertsList filterType="wellbeing" />
          </section>
        )}
      </main>
    </div>
  );
};

export default WellbeingOfficerDashboard;