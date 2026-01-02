import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import { Course } from '../../types';
import { FaBook, FaUsers, FaChartLine, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { MdVideoLibrary } from 'react-icons/md';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgRating: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const coursesRes = await apiService.getCourses();
      const allCourses = coursesRes.data || [];
      
      // Filter courses created by this instructor
      const instructorCourses = allCourses.filter(
        (course: Course) => course.instructor._id === user?.id
      );
      
      setMyCourses(instructorCourses);
      
      // Calculate stats
      const totalStudents = instructorCourses.reduce(
        (sum: number, course: Course) => sum + course.enrolledStudents, 
        0
      );
      const avgRating = instructorCourses.length > 0
        ? instructorCourses.reduce((sum: number, course: Course) => sum + course.averageRating, 0) / instructorCourses.length
        : 0;
      
      setStats({
        totalCourses: instructorCourses.length,
        totalStudents,
        avgRating,
        totalRevenue: totalStudents * 49.99 // Mock calculation
      });
    } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await apiService.deleteCourse(courseId);
      loadTeacherData(); // Reload data
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Make sure you have permission.');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading instructor dashboard...</div>;
  }

  return (
    <div className="teacher-dashboard">
      <div className="teacher-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p className="subtitle">Welcome, {user?.name}</p>
        </div>
        <button 
          className="btn-create-course"
          onClick={() => navigate('/teacher/create-course')}
        >
          <FaPlus /> Create New Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="teacher-stats-grid">
        <div className="stat-card">
          <div className="stat-icon courses">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon students">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats.avgRating.toFixed(1)} ⭐</h3>
            <p>Average Rating</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <section className="my-courses-section">
        <h2>My Courses</h2>
        
        {myCourses.length === 0 ? (
          <div className="empty-state">
            <FaBook className="empty-icon" />
            <p>You haven't created any courses yet.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/teacher/create-course')}
            >
              <FaPlus /> Create Your First Course
            </button>
          </div>
        ) : (
          <div className="courses-table">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Students</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="course-info">
                        <strong>{course.title}</strong>
                        <small>{course.difficultyLevel}</small>
                      </div>
                    </td>
                    <td>{course.enrolledStudents}</td>
                    <td>
                      <span className="rating">
                        {course.averageRating.toFixed(1)} ⭐
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon view"
                          onClick={() => window.open(`/course/${course._id}`, '_blank')}
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn-icon edit"
                          onClick={() => navigate(`/teacher/edit-course/${course._id}`)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon videos"
                          onClick={() => navigate(`/teacher/courses/${course._id}/modules`)}
                          title="Manage Videos"
                        >
                          <MdVideoLibrary />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteCourse(course._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate('/teacher/create-course')}>
            <FaPlus className="action-icon" />
            <h3>Create Course</h3>
            <p>Start building a new course</p>
          </div>
          <div className="action-card" onClick={() => navigate('/teacher/manage-courses')}>
            <FaEdit className="action-icon" />
            <h3>Manage Courses</h3>
            <p>Edit existing courses</p>
          </div>
          <div className="action-card">
            <FaChartLine className="action-icon" />
            <h3>Analytics</h3>
            <p>View detailed statistics</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;
