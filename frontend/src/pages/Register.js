import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // default role
  });
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { value: 'student', label: 'Student', description: 'Track your wellbeing and attendance' },
    { value: 'course_lead', label: 'Course Lead', description: 'Manage course and monitor students' },
    { value: 'wellbeing_officer', label: 'Wellbeing Officer', description: 'Support student wellbeing' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role: role,
    });
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password,
        formData.role
      );

      // Show success toast
      setToastMessage(`🎉 Welcome ${formData.username}! Registration successful!`);
      setShowToast(true);
      
      // Store username to pre-fill login form
      const registeredUsername = formData.username;
      
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
      });

      setTimeout(() => {
        navigate('/', { state: { registeredUsername } });
      }, 2500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {showToast && (
        <Toast 
          message={toastMessage} 
          type="success" 
          duration={2500}
          onClose={() => setShowToast(false)} 
        />
      )}
      <div className="register-card">
        <h1>Every Education</h1>
        <h2>Create Account</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          {/* Role Selection */}
          <div className="form-group">
            <label>Select Your Role</label>
            <div className="role-selector">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect(role.value)}
                >
                  <div className="role-icon">
                    {role.value === 'student' && '👤'}
                    {role.value === 'course_lead' && '👨‍🏫'}
                    {role.value === 'wellbeing_officer' && '💼'}
                  </div>
                  <div className="role-info">
                    <div className="role-name">{role.label}</div>
                    <div className="role-desc">{role.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a strong password"
              required
            />
            <small>Minimum 6 characters</small>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="register-btn">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-link">
          <p>Already have an account? <Link to="/">Login here</Link></p>
        </div>

        {/* Info Section */}
        <div className="register-info">
          <h3>About Your Role:</h3>
          <ul>
            <li><strong>Student:</strong> Track your stress levels, sleep patterns, and attendance</li>
            <li><strong>Course Lead:</strong> Monitor your students' wellbeing and academic performance</li>
            <li><strong>Wellbeing Officer:</strong> Support students and manage wellbeing initiatives</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
