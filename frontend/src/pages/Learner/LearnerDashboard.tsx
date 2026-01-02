import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { DashboardStats, Course } from '../../types';
import { FaFire, FaTrophy, FaBook, FaCheckCircle, FaSearch, FaStar } from 'react-icons/fa';
import './LearnerDashboard.css';

const LearnerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, coursesRes] = await Promise.all([
        apiService.getDashboard(),
        apiService.getCourses()
      ]);
      
      setStats(dashboardRes.data.stats);
      setEnrolledCourses(dashboardRes.data.enrolledCourses);
      
      // Get recommended courses using adaptive algorithm
      try {
        const recommendedRes = await apiService.getRecommendedCourses();
        setRecommendedCourses(recommendedRes.data.courses || []);
      } catch {
        // Fallback to filtering by career goal if adaptive API fails
        const filtered = (coursesRes.data || []).filter((course: Course) =>
          course.careerGoals?.includes(user?.careerGoal || '')
        ).slice(0, 6);
        setRecommendedCourses(filtered);
      }
      
      setAllCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await apiService.enrollCourse(courseId);
      loadDashboard(); // Refresh data
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll. You may already be enrolled in this course.');
    }
  };

  const handleUnenroll = async (courseId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to unenroll from "${courseName}"? Your progress will be lost.`)) {
      return;
    }

    try {
      await apiService.unenrollCourse(courseId);
      loadDashboard(); // Refresh data
      alert('Successfully unenrolled from the course.');
    } catch (error) {
      console.error('Error unenrolling:', error);
      alert('Failed to unenroll from the course.');
    }
  };

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unenrolledCourses = filteredCourses.filter(course => 
    !enrolledCourses.some(enrolled => enrolled.course._id === course._id)
  );

  if (loading) {
    return <div className="loading-container">Loading your learning dashboard...</div>;
  }

  return (
    <div className="learner-dashboard">
      {/* Header */}
      <div className="learner-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p className="subtitle">
            {user?.learnerBackground} learner | Career Goal: {user?.careerGoal}
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

      {/* My Enrolled Courses */}
      <section className="dashboard-section">
        <h2>My Learning Journey</h2>
        {enrolledCourses.length === 0 ? (
          <div className="empty-state">
            <FaBook className="empty-icon" />
            <p>You haven't enrolled in any courses yet.</p>
            <p className="empty-hint">Browse available courses below to start learning!</p>
          </div>
        ) : (
          <div className="courses-grid">
            {enrolledCourses.map((enrolled) => (
              <div 
                key={enrolled.course._id} 
                className="course-card enrolled"
              >
                <div className="course-thumbnail">
                  {enrolled.course.thumbnailUrl ? (
                    <img src={enrolled.course.thumbnailUrl} alt={enrolled.course.title} />
                  ) : (
                    <div className="course-thumbnail-placeholder">
                      {enrolled.course.title.charAt(0)}
                    </div>
                  )}
                  <div className="course-badge">{enrolled.progress}% Complete</div>
                </div>
                <div className="course-info">
                  <h3>{enrolled.course.title}</h3>
                  <p className="course-meta">
                    <span className="difficulty">{enrolled.course.difficultyLevel}</span>
                    <span className="duration">{enrolled.course.duration} mins</span>
                  </p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${enrolled.progress}%` }}
                    ></div>
                  </div>
                  <div className="course-actions">
                    <button 
                      className="btn-continue"
                      onClick={() => window.open(`/course/${enrolled.course._id}`, '_blank')}
                    >
                      Continue Learning →
                    </button>
                    <button 
                      className="btn-unenroll"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnenroll(enrolled.course._id, enrolled.course.title);
                      }}
                    >
                      Unenroll
                    </button>
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
          <p className="section-subtitle">Based on your goals and learning style</p>
          <div className="courses-grid">
            {recommendedCourses.slice(0, 3).map((course) => (
              <div key={course._id} className="course-card recommended">
                <div className="course-thumbnail">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} />
                  ) : (
                    <div className="course-thumbnail-placeholder">
                      {course.title.charAt(0)}
                    </div>
                  )}
                  <div className="recommended-badge">Recommended</div>
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description.substring(0, 100)}...</p>
                  <p className="course-meta">
                    <span className="difficulty">{course.difficultyLevel}</span>
                    <span className="rating">
                      <FaStar /> {course.averageRating.toFixed(1)}
                    </span>
                  </p>
                  <button 
                    className="btn-enroll"
                    onClick={() => handleEnroll(course._id)}
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Browse All Courses */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Browse All Courses</h2>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {unenrolledCourses.length === 0 ? (
          <p className="no-results">No courses found matching your search.</p>
        ) : (
          <div className="courses-grid">
            {unenrolledCourses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-thumbnail">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} />
                  ) : (
                    <div className="course-thumbnail-placeholder">
                      {course.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description.substring(0, 100)}...</p>
                  <p className="course-meta">
                    <span className="difficulty">{course.difficultyLevel}</span>
                    <span className="students">{course.enrolledStudents} students</span>
                  </p>
                  <div className="course-actions">
                    <button 
                      className="btn-enroll"
                      onClick={() => handleEnroll(course._id)}
                    >
                      Enroll Now
                    </button>
                    <button 
                      className="btn-preview"
                      onClick={() => window.open(`/course/${course._id}`, '_blank')}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LearnerDashboard;
