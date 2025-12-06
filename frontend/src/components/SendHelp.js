import React, { useState, useEffect } from 'react';
import { wellbeingAPI, alertsAPI } from '../utils/api';
import '../styles/SendHelp.css';

const SendHelp = () => {
  const [stressedStudents, setStressedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notified, setNotified] = useState(new Set());

  useEffect(() => {
    fetchStressedStudents();
  }, []);

  const fetchStressedStudents = async () => {
    try {
      setLoading(true);
      const response = await wellbeingAPI.getAllStudentsStatus();
      // Filter students with high stress (7 or above) or anxious/stressed mood
      const stressed = (response.data || []).filter(student => {
        const highStress = student.latest_stress && student.latest_stress >= 7;
        const stressedMood = student.latest_mood && 
          ['anxious', 'stressed', 'sad'].includes(student.latest_mood.toLowerCase());
        return highStress || stressedMood;
      });
      setStressedStudents(stressed);
      setError(null);
    } catch (err) {
      setError('Failed to load stressed students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendHelp = async (student) => {
    try {
      const message = `Hi ${student.first_name}, we noticed you may be feeling stressed. Do you need help? Our wellbeing team is here to support you. Please reach out if you'd like to talk.`;
      await alertsAPI.createAlert(student.id, 'wellbeing_support', message);
      setNotified((prev) => new Set([...prev, student.id]));
      alert(`Support message sent to ${student.first_name} ${student.last_name}`);
    } catch (err) {
      alert('Failed to send support message');
      console.error(err);
    }
  };

  const handleSendHelpToAll = async () => {
    const unnotified = stressedStudents.filter(s => !notified.has(s.id));
    if (unnotified.length === 0) {
      alert('All stressed students have already been notified.');
      return;
    }
    
    if (!window.confirm(`Send support message to ${unnotified.length} students?`)) {
      return;
    }

    for (const student of unnotified) {
      try {
        const message = `Hi ${student.first_name}, we noticed you may be feeling stressed. Do you need help? Our wellbeing team is here to support you. Please reach out if you'd like to talk.`;
        await alertsAPI.createAlert(student.id, 'wellbeing_support', message);
        setNotified((prev) => new Set([...prev, student.id]));
      } catch (err) {
        console.error(`Failed to notify ${student.first_name}`, err);
      }
    }
    alert(`Support messages sent to ${unnotified.length} students`);
  };

  const getStressLevel = (level) => {
    if (!level) return { label: 'Unknown', color: '#9ca3af' };
    if (level <= 3) return { label: 'Low', color: '#10b981' };
    if (level <= 5) return { label: 'Moderate', color: '#f59e0b' };
    if (level <= 7) return { label: 'High', color: '#f97316' };
    return { label: 'Very High', color: '#ef4444' };
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      happy: '😊',
      calm: '😌',
      neutral: '😐',
      sad: '😔',
      anxious: '😰',
      stressed: '😫',
      frustrated: '😤',
      tired: '😴',
    };
    return moods[mood?.toLowerCase()] || '❓';
  };

  if (loading) return <div className="loading">Loading stressed students...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="send-help-container">
      <div className="send-help-header">
        <h3>🆘 Students Who May Need Support</h3>
        <p className="info">
          Students with stress level ≥ 7 or mood: anxious/stressed/sad
        </p>
        {stressedStudents.length > 0 && (
          <button className="send-all-btn" onClick={handleSendHelpToAll}>
            📨 Send Help to All ({stressedStudents.filter(s => !notified.has(s.id)).length})
          </button>
        )}
      </div>

      {stressedStudents.length === 0 ? (
        <div className="no-stressed">
          <span className="success-icon">✅</span>
          <p>No students currently showing high stress levels!</p>
        </div>
      ) : (
        <div className="stressed-students-list">
          {stressedStudents.map((student) => {
            const stress = getStressLevel(student.latest_stress);
            return (
              <div key={student.id} className="stressed-student-card">
                <div className="student-avatar stressed">
                  {student.first_name?.[0]}{student.last_name?.[0]}
                </div>
                <div className="student-details">
                  <h4>{student.first_name} {student.last_name}</h4>
                  <p className="student-id">{student.student_id}</p>
                  <div className="stress-indicators">
                    <span 
                      className="stress-badge"
                      style={{ backgroundColor: stress.color }}
                    >
                      Stress: {student.latest_stress}/10 ({stress.label})
                    </span>
                    <span className="mood-badge">
                      {getMoodEmoji(student.latest_mood)} {student.latest_mood || 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  className={`help-btn ${notified.has(student.id) ? 'notified' : ''}`}
                  onClick={() => handleSendHelp(student)}
                  disabled={notified.has(student.id)}
                >
                  {notified.has(student.id) ? '✓ Help Sent' : '🤝 Send Help'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SendHelp;
