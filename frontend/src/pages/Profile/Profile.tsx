import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { FaUser, FaEnvelope, FaGraduationCap, FaBriefcase, FaSave } from 'react-icons/fa';
import './Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    learnerBackground: user?.learnerBackground || 'beginner',
    careerGoal: user?.careerGoal || 'Software Developer',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }
    }

    try {
      setLoading(true);
      const updateData: any = {
        name: formData.name,
        learnerBackground: formData.learnerBackground,
        careerGoal: formData.careerGoal
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await apiService.updateProfile(updateData);
      localStorage.setItem('user', JSON.stringify(response.data));
      setSuccess('Profile updated successfully! Please refresh to see changes.');
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-content">
        <form onSubmit={handleSubmit} className="profile-form">
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label><FaUser /> Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><FaEnvelope /> Email Address</label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label><FaBriefcase /> Role</label>
              <input
                type="text"
                value={user?.role || 'student'}
                disabled
                style={{ background: '#f5f5f5', cursor: 'not-allowed', textTransform: 'capitalize' }}
              />
            </div>
          </div>

          {user?.role === 'student' && (
            <div className="form-section">
              <h2>Learning Preferences</h2>
              
              <div className="form-group">
                <label><FaGraduationCap /> Learning Level</label>
                <select
                  name="learnerBackground"
                  value={formData.learnerBackground}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label><FaBriefcase /> Career Goal</label>
                <select
                  name="careerGoal"
                  value={formData.careerGoal}
                  onChange={handleChange}
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="ML Engineer">ML Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Cloud Architect">Cloud Architect</option>
                  <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-section">
            <h2>Change Password</h2>
            <p className="section-desc">Leave blank if you don't want to change your password</p>
            
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
