import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="auth-content-wrapper">
        <div className="auth-brand">
          <div className="brand-icon">📚</div>
          <h2 className="brand-title">Adaptive Learning</h2>
          <p className="brand-tagline">Transform Your Future Through Knowledge</p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>AI-Powered Recommendations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track Your Progress</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Gamified Learning</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="card-header">
            <h1>Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
          </div>
        
          {error && <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>}
          
          <div className="demo-credentials">
            <div className="demo-header">
              <span className="demo-icon">🎯</span>
              <p className="demo-title">Quick Access - Demo Accounts</p>
            </div>
            <div className="demo-accounts">
              <div className="demo-section">
                <div className="demo-badge student">Student</div>
                <div className="credential-item">
                  <span className="credential-icon">📧</span>
                  <span className="credential-text">student@test.com</span>
                </div>
                <div className="credential-item">
                  <span className="credential-icon">🔑</span>
                  <span className="credential-text">password123</span>
                </div>
              </div>
              <div className="demo-section">
                <div className="demo-badge instructor">Instructor</div>
                <div className="credential-item">
                  <span className="credential-icon">📧</span>
                  <span className="credential-text">teacher@test.com</span>
                </div>
                <div className="credential-item">
                  <span className="credential-icon">🔑</span>
                  <span className="credential-text">password123</span>
                </div>
              </div>
            </div>
          </div>
        
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="signup-link">Sign up</Link></p>
            <div className="social-login">
              <div className="divider">
                <span>or continue with</span>
              </div>
              <div className="social-buttons">
                <button className="social-btn" disabled>
                  <img src="https://www.google.com/favicon.ico" alt="Google" />
                  Google
                </button>
                <button className="social-btn" disabled>
                  <img src="https://github.com/favicon.ico" alt="GitHub" />
                  GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
