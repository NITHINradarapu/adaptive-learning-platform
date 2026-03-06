import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { CourseAnalyticsDashboard, Course, StudentPerformance, RiskAssessment } from '../../types';
import './TeacherAnalytics.css';

const TeacherAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [dashboard, setDashboard] = useState<CourseAnalyticsDashboard | null>(null);
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'questions' | 'risk'>('overview');

  useEffect(() => {
    fetchCourses();
    fetchAtRiskStudents();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchDashboard(selectedCourseId);
      fetchStudents(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const res = await apiService.getCourses();
      // Filter to only show courses owned by this instructor
      const allCourses = res.data || [];
      const teacherCourses = allCourses.filter((course: any) =>
        course.instructor?._id === user?.id || course.instructor === user?.id
      );
      setCourses(teacherCourses);
      if (teacherCourses.length > 0) {
        setSelectedCourseId(teacherCourses[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setLoading(false);
    }
  };

  const fetchDashboard = async (courseId: string) => {
    try {
      setLoading(true);
      const res = await apiService.getTeacherCourseDashboard(courseId);
      setDashboard(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (courseId: string) => {
    try {
      const res = await apiService.getTeacherStudentPerformance(courseId);
      setStudents(res.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchAtRiskStudents = async () => {
    try {
      const res = await apiService.getAtRiskStudents();
      setAtRiskStudents(res.data || []);
    } catch (error) {
      console.error('Failed to fetch at-risk students:', error);
    }
  };

  const getScoreClass = (score: number | null) => {
    if (score === null) return '';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  if (loading && !dashboard) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="teacher-analytics">
      <h1>📊 Analytics Dashboard</h1>
      <p className="subtitle">AI-powered insights into student performance and engagement</p>

      {/* Course Selector */}
      <div className="course-selector">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['overview', 'students', 'questions', 'risk'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1.25rem',
              border: activeTab === tab ? '2px solid #4361ee' : '2px solid #e0e0e0',
              borderRadius: '20px',
              background: activeTab === tab ? '#4361ee' : 'white',
              color: activeTab === tab ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {tab === 'risk' ? 'At-Risk Students' : tab}
          </button>
        ))}
      </div>

      {dashboard && activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{dashboard.enrollmentStats.totalEnrolled}</div>
              <div className="stat-label">Total Enrolled</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.enrollmentStats.averageProgress}%</div>
              <div className="stat-label">Avg Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.enrollmentStats.averageQuizScore}%</div>
              <div className="stat-label">Avg Quiz Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.enrollmentStats.completionRate}%</div>
              <div className="stat-label">Completion Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.riskStudents.length}</div>
              <div className="stat-label">At-Risk Students</div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="analytics-section">
            <h2>🤖 AI-Generated Insights</h2>
            <ul className="insights-list">
              {dashboard.insights.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>

          {/* Module Performance Heatmap */}
          <div className="analytics-section">
            <h2>📈 Topic-wise Performance Heatmap</h2>
            <div className="heatmap-grid">
              {dashboard.modulePerformance.map((mod) => (
                <div key={mod.moduleId} className="heatmap-item">
                  <div className="module-title">{mod.moduleTitle}</div>
                  <div className="score-bar">
                    <div
                      className={`fill ${getScoreClass(mod.avgScore)}`}
                      style={{ width: `${mod.avgScore || 0}%` }}
                    />
                  </div>
                  <div className="stats-row">
                    <span>Avg: {mod.avgScore !== null ? `${mod.avgScore}%` : 'N/A'}</span>
                    <span>Completion: {mod.completionRate}%</span>
                    <span>{mod.studentsAttempted} students</span>
                  </div>
                  {mod.videoDropOffs.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#ef476f' }}>
                      ⚠️ Drop-offs detected in {mod.videoDropOffs.length} video(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Distribution */}
          <div className="analytics-section">
            <h2>📊 Engagement Distribution</h2>
            <div className="engagement-bars">
              {Object.entries(dashboard.engagementDistribution).map(([level, count]) => {
                const maxCount = Math.max(...Object.values(dashboard.engagementDistribution), 1);
                const height = (count / maxCount) * 150;
                const labels: Record<string, string> = {
                  veryLow: 'Very Low',
                  low: 'Low',
                  medium: 'Medium',
                  high: 'High',
                  veryHigh: 'Very High',
                };
                return (
                  <div key={level} className="engagement-bar">
                    <div className="count">{count}</div>
                    <div
                      className={`bar ${level.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
                      style={{ height: `${Math.max(height, 4)}px` }}
                    />
                    <div className="label">{labels[level]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {dashboard && activeTab === 'students' && (
        <div className="analytics-section">
          <h2>👥 Student Performance</h2>
          <table className="question-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Progress</th>
                <th>Quiz Score</th>
                <th>Engagement</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentId} className={student.isAtRisk ? 'problematic' : ''}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.studentName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{student.studentEmail}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: '#e0e0e0', borderRadius: '3px' }}>
                        <div style={{ width: `${student.progress}%`, height: '100%', background: '#4361ee', borderRadius: '3px' }} />
                      </div>
                      {student.progress}%
                    </div>
                  </td>
                  <td>{student.quizScore}%</td>
                  <td>{Math.round((student.engagementScore || 0) * 100)}%</td>
                  <td>
                    <span className={`badge ${student.status === 'completed' ? 'success' : student.status === 'in-progress' ? 'warning' : 'danger'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    {student.isAtRisk && (
                      <span className={`badge ${student.riskLevel === 'high' ? 'danger' : 'warning'}`}>
                        {student.riskLevel}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#666' }}>
                    {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No students enrolled yet.</p>
          )}
        </div>
      )}

      {dashboard && activeTab === 'questions' && (
        <div className="analytics-section">
          <h2>❓ Question Analysis (Item Analysis)</h2>
          <table className="question-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Bloom's</th>
                <th>Success Rate</th>
                <th>Attempts</th>
                <th>Avg Time</th>
                <th>Hint Usage</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.questionAnalysis.map((q) => (
                <tr key={q.questionId} className={q.isProblematic ? 'problematic' : ''}>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.questionText}
                  </td>
                  <td>{q.questionType}</td>
                  <td><span className={`badge ${q.difficultyLevel}`}>{q.difficultyLevel}</span></td>
                  <td style={{ textTransform: 'capitalize' }}>{q.bloomsLevel}</td>
                  <td>
                    <span style={{ color: q.successRate < 40 ? '#ef476f' : q.successRate < 70 ? '#ffd166' : '#06d6a0', fontWeight: 700 }}>
                      {q.successRate}%
                    </span>
                  </td>
                  <td>{q.totalAttempts}</td>
                  <td>{q.avgTimeSpent}s</td>
                  <td>{q.hintUsageRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {dashboard.questionAnalysis.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No question data available yet.</p>
          )}
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="analytics-section">
          <h2>⚠️ At-Risk Students (All Courses)</h2>
          {atRiskStudents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#06d6a0', padding: '2rem', fontWeight: 600 }}>
              ✅ No at-risk students detected. All students are on track!
            </p>
          ) : (
            <div className="risk-list">
              {atRiskStudents.map((student, i) => (
                <div key={i} className={`risk-card ${student.riskLevel}`}>
                  <div className="risk-info">
                    <div className="student-name">
                      Student ID: {student.userId}
                      {student.courseName && <span style={{ color: '#666', fontWeight: 400 }}> — {student.courseName}</span>}
                    </div>
                    <div className="risk-factors">
                      {student.riskFactors.join(' • ')}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <strong>Suggested:</strong> {student.interventionSuggestions[0]}
                    </div>
                  </div>
                  <div className={`risk-score ${student.riskLevel}`}>
                    {student.riskScore}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAnalytics;
