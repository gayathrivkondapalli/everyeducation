import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Toast from '../components/Toast';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const navigate = useNavigate();

  // Pre-fill username if coming from registration
  useEffect(() => {
    if (location.state?.registeredUsername) {
      setUsername(location.state.registeredUsername);
      setToastMessage('Account created successfully! Please login.');
      setToastType('success');
      setShowToast(true);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      const { access_token, user_id, role } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      // Show success toast before redirect
      setToastMessage(`Welcome back, ${username}!`);
      setToastType('success');
      setShowToast(true);

      setTimeout(() => {
        onLogin();
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          duration={3000}
          onClose={() => setShowToast(false)} 
        />
      )}
      <div className="login-card">
        <h1>Every Education</h1>
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
