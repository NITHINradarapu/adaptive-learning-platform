import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './ManageQuestions.css';

interface Question {
  _id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'fill-blank' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  timestamp: number;
  points: number;
  timeLimit?: number;
  hint?: string;
}

const ManageQuestions: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'multiple-choice' as 'multiple-choice' | 'fill-blank' | 'short-answer',
    options: ['', '', '', ''],
    correctAnswer: '',
    timestamp: 0,
    points: 10,
    timeLimit: 60,
    hint: ''
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [videoRes, questionsRes] = await Promise.all([
        apiService.getVideo(videoId!),
        apiService.getVideoQuestions(videoId!)
      ]);
      setVideoTitle(videoRes.data.title);
      setQuestions(questionsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'timestamp' || name === 'points' || name === 'timeLimit' ? Number(value) : value
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const questionData: any = {
        questionText: formData.questionText,
        questionType: formData.questionType,
        correctAnswer: formData.correctAnswer,
        timestamp: formData.timestamp,
        points: formData.points,
        timeLimit: formData.timeLimit || undefined,
        hint: formData.hint || undefined
      };

      if (formData.questionType === 'multiple-choice') {
        questionData.options = formData.options.filter(opt => opt.trim() !== '');
      }

      await apiService.createQuestion(videoId!, questionData);
      
      setShowForm(false);
      setFormData({
        questionText: '',
        questionType: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        timestamp: 0,
        points: 10,
        timeLimit: 60,
        hint: ''
      });
      
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create question');
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!window.confirm('Delete this question?')) return;

    try {
      // Note: You'll need to add this endpoint to your API
      // await apiService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q._id !== questionId));
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="manage-questions-container">
      <div className="page-header">
        <div>
          <h1>Manage Interactive Questions</h1>
          <p className="video-name">{videoTitle}</p>
        </div>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#e3f2fd', borderLeft: '4px solid #2196f3', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>🎯 Attendance Requirement</h4>
        <p style={{ margin: 0, color: '#555' }}>
          <strong>Students MUST answer these questions during video playback to mark attendance.</strong><br/>
          Questions will automatically pause the video at the specified timestamp. Students cannot continue watching until they answer correctly.
          Add at least 1-3 questions per video to ensure engagement.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="actions-bar">
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> Add Question
        </button>
      </div>

      {showForm && (
        <div className="question-form-card">
          <h3>Create New Question</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Question Type *</label>
              <select
                name="questionType"
                value={formData.questionType}
                onChange={handleChange}
                required
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="fill-blank">Fill in the Blank</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Question Text *</label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>

            {formData.questionType === 'multiple-choice' && (
              <div className="form-group">
                <label>Options (Enter at least 2)</label>
                {formData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    style={{ marginBottom: '0.5rem' }}
                  />
                ))}
              </div>
            )}

            <div className="form-group">
              <label>Correct Answer *</label>
              <input
                type="text"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                required
                placeholder="Enter the correct answer"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Timestamp (seconds) *</label>
                <input
                  type="number"
                  name="timestamp"
                  value={formData.timestamp}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Time Limit (seconds)</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  min="10"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Hint (optional)</label>
              <input
                type="text"
                name="hint"
                value={formData.hint}
                onChange={handleChange}
                placeholder="Provide a hint for students"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <FaCheck /> Create Question
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="questions-list">
        <h3>Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>No interactive questions yet. Add questions to engage your students!</p>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question._id} className="question-card">
              <div className="question-header">
                <span className="question-type">{question.questionType.replace('-', ' ')}</span>
                <span className="timestamp">@ {Math.floor(question.timestamp / 60)}:{(question.timestamp % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="question-content">
                <p className="question-text">{question.questionText}</p>
                {question.options && (
                  <div className="question-options">
                    {question.options.map((opt, idx) => (
                      <span key={idx} className={`option ${opt === question.correctAnswer ? 'correct' : ''}`}>
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
                <div className="question-meta">
                  <span>Points: {question.points}</span>
                  {question.timeLimit && <span>Time: {question.timeLimit}s</span>}
                  {question.hint && <span>Has hint</span>}
                </div>
              </div>
              <div className="question-actions">
                <button className="btn-danger btn-sm" onClick={() => handleDelete(question._id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;
