import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { FaArrowLeft, FaClock, FaBook, FaVideo, FaStar, FaUserGraduate } from 'react-icons/fa';
import './CourseDetail.css';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourse(courseId!);
      setCourse(response.data);
    } catch (error) {
      console.error('Error loading course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await apiService.enrollCourse(courseId!);
      await loadCourseDetails(); // Reload to update enrollment status
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm(`Are you sure you want to unenroll from "${course.title}"? Your progress will be lost.`)) {
      return;
    }

    try {
      setEnrolling(true);
      await apiService.unenrollCourse(courseId!);
      await loadCourseDetails(); // Reload to update enrollment status
      alert('Successfully unenrolled from the course.');
    } catch (error) {
      console.error('Error unenrolling:', error);
      alert('Failed to unenroll from course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading course details...</div>;
  }

  if (!course) {
    return (
      <div className="error-container">
        <h2>Course not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      {/* Header */}
      <div className="course-detail-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="course-hero">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="course-banner" />
          ) : (
            <div className="course-banner-placeholder">
              {course.title.charAt(0)}
            </div>
          )}

          <div className="course-hero-content">
            <h1>{course.title}</h1>
            <p className="course-description-full">{course.description}</p>

            <div className="course-meta-row">
              <span className={`badge ${course.difficultyLevel}`}>
                {course.difficultyLevel}
              </span>
              <span className="meta-item">
                <FaClock /> {course.duration} minutes
              </span>
              <span className="meta-item">
                <FaBook /> {course.totalModules || 0} modules
              </span>
              <span className="meta-item">
                <FaVideo /> {course.totalVideos || 0} videos
              </span>
              <span className="meta-item">
                <FaStar /> {course.averageRating?.toFixed(1) || 'N/A'} rating
              </span>
              <span className="meta-item">
                <FaUserGraduate /> {course.enrolledStudents || 0} students
              </span>
            </div>

            {course.isEnrolled ? (
              <div className="enrolled-status">
                <div className="enrolled-badge-large">
                  ✓ Enrolled - {Math.round(course.progress || 0)}% Complete
                </div>
                <div className="action-buttons">
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      // Navigate to first video if available
                      if (course.modules && course.modules[0]?.videos && course.modules[0].videos[0]) {
                        navigate(`/video/${course.modules[0].videos[0]._id}`);
                      } else {
                        alert('No videos available yet');
                      }
                    }}
                  >
                    Continue Learning
                  </button>
                  <button 
                    className="btn-unenroll-large"
                    onClick={handleUnenroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Unenrolling...' : 'Unenroll'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="btn-enroll-large"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : 'Enroll in This Course'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="course-detail-content">
        {/* About Section */}
        <section className="detail-section">
          <h2>About This Course</h2>
          <div className="about-grid">
            <div className="about-item">
              <h3>Instructor</h3>
              <p>{course.instructor?.name || 'Anonymous'}</p>
            </div>
            <div className="about-item">
              <h3>Career Goals</h3>
              <div className="tags-container">
                {course.careerGoals?.map((goal: string, index: number) => (
                  <span key={index} className="tag">{goal}</span>
                ))}
              </div>
            </div>
            <div className="about-item">
              <h3>Tags</h3>
              <div className="tags-container">
                {course.tags?.map((tag: string, index: number) => (
                  <span key={index} className="tag tag-secondary">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Course Modules */}
        {course.modules && course.modules.length > 0 ? (
          <section className="detail-section">
            <h2>Course Content</h2>
            <div className="modules-list">
              {course.modules.map((module: any, index: number) => (
                <div key={module._id} className="module-item">
                  <div className="module-header">
                    <h3>
                      <FaBook /> Module {index + 1}: {module.title}
                    </h3>
                    <span className="module-duration">{module.duration || 0} min</span>
                  </div>
                  <p className="module-description">{module.description}</p>
                  
                  {module.videos && module.videos.length > 0 && (
                    <div className="videos-list">
                      {module.videos.map((video: any, vidIndex: number) => (
                        <div key={video._id} className="video-item">
                          <FaVideo className="video-icon" />
                          <span className="video-title">
                            {vidIndex + 1}. {video.title}
                          </span>
                          <span className="video-duration">{video.duration} min</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="detail-section">
            <h2>Course Content</h2>
            <div className="empty-content">
              <p>Course content is being prepared. Check back soon!</p>
            </div>
          </section>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <section className="detail-section">
            <h2>Prerequisites</h2>
            <ul className="prerequisites-list">
              {course.prerequisites.map((prereq: string, index: number) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
