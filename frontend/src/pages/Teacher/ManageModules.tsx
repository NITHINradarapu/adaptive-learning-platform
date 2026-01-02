import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './ManageModules.css';

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  difficultyLevel: string;
  estimatedTime: number;
  videoCount?: number;
}

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
}

const ManageModules: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [videos, setVideos] = useState<{ [moduleId: string]: Video[] }>({});

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    difficultyLevel: 'beginner',
    estimatedTime: 30
  });

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0
  });

  useEffect(() => {
    loadCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const course = await apiService.getCourse(courseId!);
      setCourseName(course.title);
      await loadModules();
    } catch (err: any) {
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const response = await apiService.getCourseModules(courseId!);
      setModules(response.data || []);
    } catch (err) {
      console.error('Failed to load modules', err);
      setError('Failed to load modules');
    }
  };

  const loadVideos = async (moduleId: string) => {
    try {
      const response = await apiService.getModuleVideos(moduleId);
      setVideos(prev => ({ ...prev, [moduleId]: response.data || [] }));
    } catch (err) {
      console.error('Failed to load videos', err);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createModule(courseId!, moduleForm);
      setShowModuleForm(false);
      setModuleForm({
        title: '',
        description: '',
        difficultyLevel: 'beginner',
        estimatedTime: 30
      });
      await loadModules();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create module');
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    try {
      await apiService.createVideo(selectedModule, videoForm);
      setShowVideoForm(false);
      setVideoForm({
        title: '',
        description: '',
        videoUrl: '',
        duration: 0
      });
      await loadVideos(selectedModule);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create video');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Delete this module and all its videos?')) return;
    
    try {
      await apiService.deleteModule(moduleId);
      await loadModules();
      setVideos(prev => {
        const newVideos = { ...prev };
        delete newVideos[moduleId];
        return newVideos;
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleDeleteVideo = async (videoId: string, moduleId: string) => {
    if (!window.confirm('Delete this video?')) return;
    
    try {
      await apiService.deleteVideo(videoId);
      await loadVideos(moduleId);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete video');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-modules-container">
      <div className="page-header">
        <div>
          <h1>Manage Course Content</h1>
          <p className="course-name">{courseName}</p>
        </div>
        <button className="btn-back" onClick={() => navigate('/teacher/manage-courses')}>
          ← Back to Courses
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="actions-bar">
        <button 
          className="btn-primary" 
          onClick={() => setShowModuleForm(!showModuleForm)}
        >
          + Add Module
        </button>
      </div>

      {showModuleForm && (
        <div className="form-card">
          <h3>Create New Module</h3>
          <form onSubmit={handleCreateModule}>
            <div className="form-group">
              <label>Module Title *</label>
              <input
                type="text"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={moduleForm.difficultyLevel}
                  onChange={(e) => setModuleForm({ ...moduleForm, difficultyLevel: e.target.value })}
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
                  value={moduleForm.estimatedTime}
                  onChange={(e) => setModuleForm({ ...moduleForm, estimatedTime: Number(e.target.value) })}
                  min="1"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Create Module</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModuleForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="modules-list">
        {modules.length === 0 ? (
          <div className="empty-state">
            <p>No modules yet. Create your first module to start adding videos.</p>
          </div>
        ) : (
          modules.map((module) => (
            <div key={module._id} className="module-card">
              <div className="module-header">
                <div>
                  <h3>Module {module.order}: {module.title}</h3>
                  <p>{module.description}</p>
                  <div className="module-meta">
                    <span className="badge">{module.difficultyLevel}</span>
                    <span>{module.estimatedTime} min</span>
                  </div>
                </div>
                <div className="module-actions">
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => {
                      setSelectedModule(module._id);
                      setShowVideoForm(true);
                      if (!videos[module._id]) loadVideos(module._id);
                    }}
                  >
                    + Add Video
                  </button>
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => handleDeleteModule(module._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {showVideoForm && selectedModule === module._id && (
                <div className="video-form">
                  <h4>Add Video to Module</h4>
                  <form onSubmit={handleCreateVideo}>
                    <div className="form-group">
                      <label>Video Title *</label>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Video URL * (YouTube, Vimeo, or direct link)</label>
                      <input
                        type="url"
                        value={videoForm.videoUrl}
                        onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration (seconds)</label>
                      <input
                        type="number"
                        value={videoForm.duration}
                        onChange={(e) => setVideoForm({ ...videoForm, duration: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Add Video</button>
                      <button type="button" className="btn-secondary" onClick={() => setShowVideoForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="videos-list">
                {videos[module._id]?.length > 0 ? (
                  videos[module._id].map((video) => (
                    <div key={video._id} className="video-item">
                      <div className="video-info">
                        <strong>{video.order}. {video.title}</strong>
                        <p>{video.description}</p>
                        <span className="video-meta">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => handleDeleteVideo(video._id, module._id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <button
                    className="load-videos-btn"
                    onClick={() => loadVideos(module._id)}
                  >
                    Load Videos
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageModules;
