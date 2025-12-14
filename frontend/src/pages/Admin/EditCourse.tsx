import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { CareerGoal } from '../../types';
import './AdminCourses.css';

const EditCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'beginner',
    careerGoals: [] as string[],
    duration: '',
    thumbnailUrl: '',
    tags: '',
    isPublished: true
  });

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourse(courseId!);
      const course = response.data;
      
      setFormData({
        title: course.title || '',
        description: course.description || '',
        difficultyLevel: course.difficultyLevel || 'beginner',
        careerGoals: course.careerGoals || [],
        duration: course.duration?.toString() || '',
        thumbnailUrl: course.thumbnailUrl || '',
        tags: course.tags?.join(', ') || '',
        isPublished: course.isPublished !== false
      });
    } catch (err: any) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCareerGoalToggle = (goal: string) => {
    setFormData({
      ...formData,
      careerGoals: formData.careerGoals.includes(goal)
        ? formData.careerGoals.filter(g => g !== goal)
        : [...formData.careerGoals, goal]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!formData.title || !formData.description || !formData.duration) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      if (formData.careerGoals.length === 0) {
        setError('Please select at least one career goal');
        setSaving(false);
        return;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        difficultyLevel: formData.difficultyLevel,
        careerGoals: formData.careerGoals,
        duration: parseInt(formData.duration),
        thumbnailUrl: formData.thumbnailUrl || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isPublished: formData.isPublished
      };

      await apiService.updateCourse(courseId!, courseData);
      
      setSuccess('Course updated successfully!');
      
      setTimeout(() => {
        navigate('/admin/manage-courses');
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading course...</div>;
  }

  return (
    <div className="admin-courses-container">
      <div className="admin-courses-header">
        <h1>Edit Course</h1>
        <button className="btn-back" onClick={() => navigate('/admin/manage-courses')}>
          ← Back to Manage Courses
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="course-form">
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
                placeholder="e.g., 480"
                min="1"
                required
              />
            </div>
          </div>

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
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., JavaScript, Programming, Web Development"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Career Goals *</h2>
          <p className="section-description">Select all relevant career paths for this course</p>
          
          <div className="career-goals-grid">
            {Object.values(CareerGoal).map((goal) => (
              <div
                key={goal}
                className={`career-goal-card ${formData.careerGoals.includes(goal) ? 'selected' : ''}`}
                onClick={() => handleCareerGoalToggle(goal)}
              >
                <input
                  type="checkbox"
                  checked={formData.careerGoals.includes(goal)}
                  onChange={() => {}}
                  className="career-goal-checkbox"
                />
                <span className="career-goal-label">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Publishing Status</h2>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <span>Publish this course (make it visible to students)</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/manage-courses')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Updating...' : 'Update Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
