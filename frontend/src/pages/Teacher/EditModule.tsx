import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { FaSave, FaTimes } from 'react-icons/fa';
import './EditModule.css';

const EditModule: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'beginner',
    estimatedTime: 30
  });

  useEffect(() => {
    loadModule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const response = await apiService.getModule(moduleId!);
      const module = response.data;
      
      setFormData({
        title: module.title || '',
        description: module.description || '',
        difficultyLevel: module.difficultyLevel || 'beginner',
        estimatedTime: module.estimatedTime || 30
      });
    } catch (err) {
      setError('Failed to load module');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await apiService.updateModule(moduleId!, {
        ...formData,
        estimatedTime: Number(formData.estimatedTime)
      });
      
      navigate(-1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update module');
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="edit-module-container">
      <div className="page-header">
        <h1>Edit Module</h1>
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaTimes /> Cancel
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Module Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Difficulty Level</label>
            <select
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estimated Time (minutes)</label>
            <input
              type="number"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditModule;
