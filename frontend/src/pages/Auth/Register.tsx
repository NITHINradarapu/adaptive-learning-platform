import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LearnerBackground, CareerGoal } from '../../types';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    learnerBackground: LearnerBackground.BEGINNER,
    careerGoal: CareerGoal.OTHER
  });
  
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Start your personalized learning journey</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                minLength={6}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="learnerBackground">Experience Level</label>
            <select
              id="learnerBackground"
              name="learnerBackground"
              value={formData.learnerBackground}
              onChange={handleChange}
              required
            >
              <option value={LearnerBackground.BEGINNER}>Beginner - New to the field</option>
              <option value={LearnerBackground.INTERMEDIATE}>Intermediate - Some experience</option>
              <option value={LearnerBackground.ADVANCED}>Advanced - Experienced learner</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="careerGoal">Career Goal</label>
            <select
              id="careerGoal"
              name="careerGoal"
              value={formData.careerGoal}
              onChange={handleChange}
              required
            >
              <option value={CareerGoal.SOFTWARE_DEVELOPER}>Software Developer</option>
              <option value={CareerGoal.WEB_DEVELOPER}>Web Developer</option>
              <option value={CareerGoal.DATA_ANALYST}>Data Analyst</option>
              <option value={CareerGoal.ML_ENGINEER}>ML Engineer</option>
              <option value={CareerGoal.TEACHER}>Teacher</option>
              <option value={CareerGoal.OTHER}>Other</option>
            </select>
          </div>
          
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
