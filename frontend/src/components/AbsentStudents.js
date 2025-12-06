import React, { useState, useEffect } from 'react';
import { attendanceAPI, alertsAPI } from '../utils/api';
import '../styles/AbsentStudents.css';

const AbsentStudents = ({ threshold = 0.8, days = 30 }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notified, setNotified] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await attendanceAPI.getAbsentStudents(days, threshold);
        setStudents(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load absent students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [threshold, days]);

  const handleNotifyStudent = async (studentId, studentName) => {
    try {
      const message = `You have been absent from recent classes. Please contact your course lead for support.`;
      await alertsAPI.createAlert(studentId, 'low_attendance', message);
      setNotified((prev) => new Set([...prev, studentId]));
      alert(`Notification sent to ${studentName}`);
    } catch (err) {
      alert('Failed to send notification');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading absent students...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="absent-students-container">
      <h3>Students with Low Attendance ({days} days)</h3>
      <p className="info">
        Showing students with attendance below {(threshold * 100).toFixed(0)}%
      </p>
      {students.length === 0 ? (
        <p className="no-data">All students have good attendance!</p>
      ) : (
        <div className="students-list">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-info">
                <h4>
                  {student.first_name} {student.last_name}
                </h4>
                <p className="student-id">ID: {student.student_id}</p>
                <div className="attendance-stats">
                  <span className="stat">
                    Present: <strong>{student.present_count}</strong>
                  </span>
                  <span className="stat">
                    Total: <strong>{student.total_classes}</strong>
                  </span>
                  <span className="stat rate">
                    Rate: <strong>{(student.attendance_rate * 100).toFixed(1)}%</strong>
                  </span>
                </div>
              </div>
              <button
                className="notify-btn"
                onClick={() =>
                  handleNotifyStudent(student.id, `${student.first_name} ${student.last_name}`)
                }
                disabled={notified.has(student.id)}
              >
                {notified.has(student.id) ? '✓ Notified' : 'Notify'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AbsentStudents;
