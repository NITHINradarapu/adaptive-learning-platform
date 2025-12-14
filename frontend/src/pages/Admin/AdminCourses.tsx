import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { CareerGoal } from '../../types';
import './AdminCourses.css';

const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'beginner',
    careerGoals: [] as string[],
    duration: '',
    thumbnailUrl: '',
    tags: ''
  });

  const careerGoalOptions = [
    CareerGoal.SOFTWARE_DEVELOPER,
    CareerGoal.DATA_ANALYST,
    CareerGoal.TEACHER,
    CareerGoal.WEB_DEVELOPER,
    CareerGoal.ML_ENGINEER,
    CareerGoal.OTHER
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCareerGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      careerGoals: prev.careerGoals.includes(goal)
        ? prev.careerGoals.filter(g => g !== goal)
        : [...prev.careerGoals, goal]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate
      if (!formData.title || !formData.description || !formData.duration) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (formData.careerGoals.length === 0) {
        setError('Please select at least one career goal');
        setLoading(false);
        return;
      }

      // Prepare data
      const courseData = {
        title: formData.title,
        description: formData.description,
        difficultyLevel: formData.difficultyLevel,
        careerGoals: formData.careerGoals,
        duration: parseInt(formData.duration),
        thumbnailUrl: formData.thumbnailUrl || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isPublished: true // Make course visible immediately
      };

      await apiService.createCourse(courseData);
      
      setSuccess('Course created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficultyLevel: 'beginner',
        careerGoals: [],
        duration: '',
        thumbnailUrl: '',
        tags: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-courses-container">
      <div className="admin-courses-header">
        <h1>Create New Course</h1>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="course-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Course Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., JavaScript Fundamentals"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course..."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficultyLevel">Difficulty Level *</label>
              <select
                id="difficultyLevel"
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleChange}
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 120"
                min="1"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Career Goals *</h2>
          <p className="form-help">Select which career paths this course is relevant for</p>
          
          <div className="career-goals-grid">
            {careerGoalOptions.map(goal => (
              <label key={goal} className="checkbox-card">
                <input
                  type="checkbox"
                  checked={formData.careerGoals.includes(goal)}
                  onChange={() => handleCareerGoalToggle(goal)}
                />
                <span>{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Details</h2>
          
          <div className="form-group">
            <label htmlFor="thumbnailUrl">Thumbnail URL</label>
            <input
              type="url"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <small>Optional: Add a URL to a course thumbnail image</small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="javascript, programming, web-development"
            />
            <small>Separate tags with commas</small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourses;
