import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaGraduationCap, FaUser, FaSignOutAlt, FaPlus, FaCog, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTeacher = user?.role === 'instructor' || user?.role === 'admin';
  const dashboardLink = isTeacher ? '/teacher/dashboard' : '/learner/dashboard';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={dashboardLink} className="navbar-brand">
          <FaGraduationCap className="brand-icon" />
          <span>Adaptive Learning</span>
        </Link>

        <div className="navbar-menu">
          <Link to={dashboardLink} className="nav-link">
            {isTeacher ? <FaChalkboardTeacher /> : <FaBook />}
            Dashboard
          </Link>
          
          {isTeacher ? (
            // Teacher/Instructor menu
            <>
              <Link to="/teacher/manage-courses" className="nav-link">
                <FaCog /> Manage Courses
              </Link>
              
              <Link to="/teacher/create-course" className="nav-link nav-link-primary">
                <FaPlus /> Create Course
              </Link>
            </>
          ) : (
            // Learner menu
            <Link to="/learner/dashboard" className="nav-link">
              <FaBook /> My Courses
            </Link>
          )}
          
          <div className="user-menu">
            <div className="user-info">
              <FaUser className="user-icon" />
              <span>{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
