import React, { useState } from 'react';
import { wellbeingAPI } from '../utils/api';
import Toast from './Toast';
import '../styles/WellbeingSurvey.css';

const WellbeingSurvey = () => {
  const [formData, setFormData] = useState({
    sleepLevel: 5,
    stressLevel: 5,
    mood: '',
    comments: '',
    requests: '',
  });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [submitted, setSubmitted] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '😌', label: 'Calm', value: 'calm' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '😔', label: 'Sad', value: 'sad' },
    { emoji: '😰', label: 'Anxious', value: 'anxious' },
    { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
    { emoji: '😴', label: 'Tired', value: 'tired' },
    { emoji: '🤒', label: 'Unwell', value: 'unwell' },
  ];

  const getSleepEmoji = (level) => {
    if (level <= 2) return '😫';
    if (level <= 4) return '😪';
    if (level <= 6) return '😐';
    if (level <= 8) return '😊';
    return '😴💤';
  };

  const getStressEmoji = (level) => {
    if (level <= 2) return '😌';
    if (level <= 4) return '🙂';
    if (level <= 6) return '😐';
    if (level <= 8) return '😰';
    return '🤯';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mood) {
      setToastMessage('Please select your current mood');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem('user_id');
      await wellbeingAPI.recordWellbeing(userId, {
        sleep_level: formData.sleepLevel,
        stress_level: formData.stressLevel,
        mood: formData.mood,
        comments: formData.comments,
        requests: formData.requests,
      });

      setToastMessage('Thank you for sharing! Your wellbeing has been recorded. 💚');
      setToastType('success');
      setShowToast(true);
      setSubmitted(true);

      // Reset form after submission
      setFormData({
        sleepLevel: 5,
        stressLevel: 5,
        mood: '',
        comments: '',
        requests: '',
      });

    } catch (err) {
      setToastMessage('Failed to submit. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="survey-container">
        {showToast && (
          <Toast 
            message={toastMessage} 
            type={toastType} 
            onClose={() => setShowToast(false)} 
          />
        )}
        <div className="survey-success">
          <div className="success-icon">✅</div>
          <h2>Thank You!</h2>
          <p>Your wellbeing check-in has been recorded.</p>
          <p>Remember, it's okay to ask for help if you need it. 💚</p>
          <button 
            className="submit-another-btn"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-container">
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
      
      <div className="survey-header">
        <h2>Daily Wellbeing Check-in</h2>
        <p>Take a moment to reflect on how you're feeling today</p>
      </div>

      <form onSubmit={handleSubmit} className="survey-form">
        {/* Sleep Level */}
        <div className="survey-section">
          <label className="section-label">
            <span className="label-emoji">🛏️</span>
            How well did you sleep last night?
          </label>
          <div className="slider-container">
            <span className="slider-label">Poor</span>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.sleepLevel}
              onChange={(e) => setFormData({...formData, sleepLevel: parseInt(e.target.value)})}
              className="slider"
            />
            <span className="slider-label">Great</span>
          </div>
          <div className="slider-value">
            <span className="value-emoji">{getSleepEmoji(formData.sleepLevel)}</span>
            <span className="value-number">{formData.sleepLevel}/10</span>
          </div>
        </div>

        {/* Stress Level */}
        <div className="survey-section">
          <label className="section-label">
            <span className="label-emoji">📊</span>
            What's your stress level today?
          </label>
          <div className="slider-container">
            <span className="slider-label">Low</span>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.stressLevel}
              onChange={(e) => setFormData({...formData, stressLevel: parseInt(e.target.value)})}
              className="slider"
            />
            <span className="slider-label">High</span>
          </div>
          <div className="slider-value">
            <span className="value-emoji">{getStressEmoji(formData.stressLevel)}</span>
            <span className="value-number">{formData.stressLevel}/10</span>
          </div>
        </div>

        {/* Mood Selection */}
        <div className="survey-section">
          <label className="section-label">
            <span className="label-emoji">💭</span>
            How are you feeling right now?
          </label>
          <div className="mood-grid">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                className={`mood-btn ${formData.mood === mood.value ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, mood: mood.value})}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comments (Optional) */}
        <div className="survey-section">
          <label className="section-label">
            <span className="label-emoji">📝</span>
            Any comments about how you're feeling? <span className="optional">(Optional)</span>
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({...formData, comments: e.target.value})}
            placeholder="Share anything on your mind..."
            className="survey-textarea"
            rows={3}
          />
        </div>

        {/* Requests (Optional) */}
        <div className="survey-section">
          <label className="section-label">
            <span className="label-emoji">🙋</span>
            Do you need any support or have any requests? <span className="optional">(Optional)</span>
          </label>
          <textarea
            value={formData.requests}
            onChange={(e) => setFormData({...formData, requests: e.target.value})}
            placeholder="Let us know if you need help with anything..."
            className="survey-textarea"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="survey-submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Check-in 💚'}
        </button>
      </form>

      <div className="survey-footer">
        <p>🔒 Your responses are confidential and will only be shared with wellbeing officers if you need support.</p>
      </div>
    </div>
  );
};

export default WellbeingSurvey;
