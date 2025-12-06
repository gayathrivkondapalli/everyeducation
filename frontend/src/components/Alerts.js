import React, { useState, useEffect } from 'react';
import { wellbeingAPI, alertsAPI } from '../utils/api';
import '../styles/Alerts.css';

// filterType: 'wellbeing' (stress/sleep), 'attendance', or 'all'
const AlertsList = ({ filterType = 'all', title }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [filterType]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getUnreadAlerts();
      let filteredAlerts = response.data || [];
      
      // Filter based on type
      if (filterType === 'wellbeing') {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.alert_type === 'high_stress' || 
          alert.alert_type === 'low_sleep' ||
          alert.alert_type === 'wellbeing'
        );
      } else if (filterType === 'attendance') {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.alert_type === 'low_attendance' || 
          alert.alert_type === 'attendance' ||
          alert.message?.toLowerCase().includes('attendance') ||
          alert.message?.toLowerCase().includes('absent')
        );
      }
      
      setAlerts(filteredAlerts);
      setError(null);
    } catch (err) {
      setError('Failed to load alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (alertId) => {
    try {
      await alertsAPI.markAlertRead(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Failed to mark alert as read', err);
    }
  };

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'high_stress':
        return '#ff9800';
      case 'low_sleep':
        return '#2196f3';
      case 'low_attendance':
        return '#f44336';
      default:
        return '#9c27b0';
    }
  };

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'high_stress':
        return '⚠️';
      case 'low_sleep':
        return '😴';
      case 'low_attendance':
        return '📋';
      default:
        return 'ℹ️';
    }
  };

  if (loading) return <div className="loading">Loading alerts...</div>;

  const getTitle = () => {
    if (title) return title;
    if (filterType === 'wellbeing') return 'Stress & Wellbeing Alerts';
    if (filterType === 'attendance') return 'Attendance Alerts';
    return 'All Alerts';
  };

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h3>{getTitle()}</h3>
        <span className="alert-count">{alerts.length} new</span>
      </div>

      {error && <div className="error">{error}</div>}

      {alerts.length === 0 ? (
        <p className="no-alerts">No new alerts</p>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="alert-item"
              style={{ borderLeftColor: getAlertColor(alert.alert_type) }}
            >
              <div className="alert-icon">{getAlertIcon(alert.alert_type)}</div>
              <div className="alert-content">
                <h4>{alert.first_name} {alert.last_name}</h4>
                <p className="alert-message">{alert.message}</p>
                <p className="alert-type">{alert.alert_type.replace('_', ' ').toUpperCase()}</p>
                <p className="alert-date">
                  {new Date(alert.created_date).toLocaleString()}
                </p>
              </div>
              <button
                className="dismiss-btn"
                onClick={() => handleMarkRead(alert.id)}
              >
                ✓ Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsList;
