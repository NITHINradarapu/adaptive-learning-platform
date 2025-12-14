import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaGraduationCap, FaUser, FaSignOutAlt, FaPlus, FaCog } from 'react-icons/fa';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <FaGraduationCap className="brand-icon" />
          <span>Adaptive Learning</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          
          <Link to="/admin/manage-courses" className="nav-link">
            <FaCog /> Manage Courses
          </Link>
          
          <Link to="/admin/courses" className="nav-link nav-link-primary">
            <FaPlus /> Create Course
          </Link>
          
          <div className="user-menu">
            <div className="user-info">
              <FaUser className="user-icon" />
              <span>{user?.name}</span>
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
