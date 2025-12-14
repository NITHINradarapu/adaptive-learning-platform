import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { DashboardStats, Course } from '../../types';
import { FaFire, FaTrophy, FaBook, FaCheckCircle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, recommendedRes, coursesRes] = await Promise.all([
        apiService.getDashboard(),
        apiService.getRecommendedCourses(),
        apiService.getCourses()
      ]);
      
      setStats(dashboardRes.data.stats);
      setEnrolledCourses(dashboardRes.data.enrolledCourses);
      setRecommendedCourses(recommendedRes.data.courses || []);
      setAllCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p className="subtitle">
            {user?.learnerBackground} learner | Goal: {user?.careerGoal}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card streak">
          <div className="stat-icon">
            <FaFire />
          </div>
          <div className="stat-content">
            <h3>{stats?.currentStreak || 0}</h3>
            <p>Day Streak</p>
            <span className="stat-detail">Longest: {stats?.longestStreak || 0} days</span>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{Math.round(stats?.averageProgress || 0)}%</h3>
            <p>Avg Progress</p>
            <span className="stat-detail">
              {stats?.coursesInProgress || 0} courses in progress
            </span>
          </div>
        </div>

        <div className="stat-card score">
          <div className="stat-icon">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <h3>{Math.round(stats?.averageQuizScore || 0)}%</h3>
            <p>Quiz Score</p>
            <span className="stat-detail">
              {stats?.totalCheckpointsCompleted || 0} checkpoints completed
            </span>
          </div>
        </div>

        <div className="stat-card time">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{Math.round((stats?.totalTimeSpent || 0) / 60)}h</h3>
            <p>Learning Time</p>
            <span className="stat-detail">
              {stats?.coursesCompleted || 0} courses completed
            </span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <section className="dashboard-section">
        <h2>Your Courses</h2>
        {enrolledCourses.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {enrolledCourses.map((enrolled) => (
              <div 
                key={enrolled.course._id} 
                className="course-card"
              >
                <div 
                  className="course-thumbnail course-clickable"
                  onClick={() => window.open(`/course/${enrolled.course._id}`, '_blank')}
                  style={{ cursor: 'pointer' }}
                >
                  {enrolled.course.thumbnailUrl ? (
                    <img src={enrolled.course.thumbnailUrl} alt={enrolled.course.title} />
                  ) : (
                    <div className="course-thumbnail-placeholder">
                      {enrolled.course.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="course-info">
                  <h3 
                    className="course-title-clickable"
                    onClick={() => window.open(`/course/${enrolled.course._id}`, '_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    {enrolled.course.title}
                  </h3>
                  <div className="course-meta">
                    <span className={`badge ${enrolled.course.difficultyLevel}`}>
                      {enrolled.course.difficultyLevel}
                    </span>
                    <span className="progress-badge">
                      {Math.round(enrolled.progress)}% complete
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${enrolled.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <section className="dashboard-section">
          <h2>Recommended for You</h2>
          <p className="section-subtitle">
            Based on your profile: {user?.learnerBackground} level, {user?.careerGoal}
          </p>
          <div className="courses-grid">
            {recommendedCourses.slice(0, 3).map((course) => (
              <div 
                key={course._id} 
                className="course-card recommended"
              >
                <div 
                  className="course-thumbnail course-clickable"
                  onClick={() => window.open(`/course/${course._id}`, '_blank')}
                  style={{ cursor: 'pointer' }}
                >
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} />
                  ) : (
                    <div className="course-thumbnail-placeholder">
                      {course.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="course-info">
                  <h3 
                    className="course-title-clickable"
                    onClick={() => window.open(`/course/${course._id}`, '_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    {course.title}
                  </h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <span className={`badge ${course.difficultyLevel}`}>
                      {course.difficultyLevel}
                    </span>
                    <span>{course.duration} min</span>
                  </div>
                  <button 
                    className="btn-enroll"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await apiService.enrollCourse(course._id);
                        loadDashboard(); // Reload to show enrolled course
                      } catch (error) {
                        console.error('Error enrolling:', error);
                      }
                    }}
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Courses */}
      <section className="dashboard-section">
        <h2>All Available Courses</h2>
        {allCourses.length === 0 ? (
          <div className="empty-state">
            <p>No courses available yet. Create your first course!</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/admin/courses')}
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {allCourses.map((course) => (
              <div 
                key={course._id} 
                className="course-card"
              >
                <div 
                  className="course-thumbnail course-clickable"
                  onClick={() => window.open(`/course/${course._id}`, '_blank')}
                  style={{ cursor: 'pointer' }}
                >
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} />
                  ) : (
                    <div className="course-thumbnail-placeholder">
                      {course.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="course-info">
                  <h3 
                    className="course-title-clickable"
                    onClick={() => window.open(`/course/${course._id}`, '_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    {course.title}
                  </h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <span className={`badge ${course.difficultyLevel}`}>
                      {course.difficultyLevel}
                    </span>
                    <span>{course.duration} min</span>
                  </div>
                  {course.isEnrolled ? (
                    <div className="enrolled-badge">
                      ✓ Enrolled - {Math.round(course.progress || 0)}% complete
                    </div>
                  ) : (
                    <button 
                      className="btn-enroll"
                      onClick={async () => {
                        try {
                          await apiService.enrollCourse(course._id);
                          loadDashboard();
                        } catch (error) {
                          console.error('Error enrolling:', error);
                        }
                      }}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
