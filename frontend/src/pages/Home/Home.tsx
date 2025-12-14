import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand-name">Adaptive Learning Platform</span>
          </h1>
          <p className="hero-subtitle">
            Personalized Learning Paths Powered by AI
          </p>
          <p className="hero-description">
            Experience intelligent course recommendations, interactive video learning, 
            and real-time progress tracking tailored to your unique learning style.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Adaptive Learning</h3>
            <p>AI-powered recommendations based on your progress, performance, and career goals.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📹</div>
            <h3>Interactive Videos</h3>
            <p>Learn through engaging video content with integrated quizzes and real-time feedback.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your learning journey with detailed analytics and personalized insights.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Skill-Based Learning</h3>
            <p>Master new technologies with courses designed for beginners to advanced learners.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Career-Focused</h3>
            <p>Align your learning with career objectives in web development, ML, DevOps, and more.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Learn at Your Pace</h3>
            <p>Access courses anytime, anywhere with our flexible learning environment.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">12+</div>
            <div className="stat-label">Expert Courses</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100+</div>
            <div className="stat-label">Video Lessons</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">AI</div>
            <div className="stat-label">Powered Recommendations</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Learning Access</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Your Learning Journey?</h2>
        <p>Join thousands of learners advancing their careers with adaptive learning technology</p>
        <button 
          className="btn btn-cta" 
          onClick={() => navigate('/register')}
        >
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2025 Adaptive Learning Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
