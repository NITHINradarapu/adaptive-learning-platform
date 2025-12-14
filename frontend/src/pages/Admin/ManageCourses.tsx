import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import './ManageCourses.css';

const ManageCourses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCourses();
      // Filter courses by current user (instructor)
      const myCourses = response.data.filter((course: any) => 
        course.instructor?._id === user?.id || course.instructor === user?.id
      );
      setCourses(myCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(courseId);
      await apiService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
      alert('Course deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      alert(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading your courses...</div>;
  }

  return (
    <div className="manage-courses-container">
      <div className="manage-header">
        <div>
          <h1>Manage Your Courses</h1>
          <p className="subtitle">Create, edit, and manage all your courses</p>
        </div>
        <button 
          className="btn-create"
          onClick={() => navigate('/admin/courses')}
        >
          <FaPlus /> Create New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <h2>No courses yet</h2>
          <p>You haven't created any courses. Start by creating your first course!</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/admin/courses')}
          >
            <FaPlus /> Create Your First Course
          </button>
        </div>
      ) : (
        <div className="courses-table-container">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Difficulty</th>
                <th>Duration</th>
                <th>Students</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>
                    <div className="course-info-cell">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="course-thumb" />
                      ) : (
                        <div className="course-thumb-placeholder">
                          {course.title.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="course-title">{course.title}</div>
                        <div className="course-description-short">
                          {course.description.substring(0, 80)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${course.difficultyLevel}`}>
                      {course.difficultyLevel}
                    </span>
                  </td>
                  <td>{course.duration} min</td>
                  <td>{course.enrolledStudents || 0}</td>
                  <td>
                    <span className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => window.open(`/course/${course._id}`, '_blank')}
                        title="View Course"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/admin/courses/edit/${course._id}`)}
                        title="Edit Course"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(course._id, course.title)}
                        disabled={deleting === course._id}
                        title="Delete Course"
                      >
                        {deleting === course._id ? '...' : <FaTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
