import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import LearnerDashboard from './pages/Learner/LearnerDashboard';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import ManageModules from './pages/Teacher/ManageModules';
import AdminCourses from './pages/Admin/AdminCourses';
import ManageCourses from './pages/Admin/ManageCourses';
import EditCourse from './pages/Admin/EditCourse';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" />;
  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return <Navigate to="/learner/dashboard" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Determine dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'instructor' || user.role === 'admin') {
      return '/teacher/dashboard';
    }
    return '/learner/dashboard';
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar />}
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Home />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Register />} />
            
            {/* Old dashboard route - redirect based on role */}
            <Route
              path="/dashboard"
              element={<Navigate to={getDashboardRoute()} replace />}
            />
            
            {/* Learner Dashboard */}
            <Route
              path="/learner/dashboard"
              element={
                <PrivateRoute>
                  <LearnerDashboard />
                </PrivateRoute>
              }
            />
            
            {/* Teacher Dashboard */}
            <Route
              path="/teacher/dashboard"
              element={
                <TeacherRoute>
                  <TeacherDashboard />
                </TeacherRoute>
              }
            />
            
            {/* Teacher Routes */}
            <Route
              path="/teacher/create-course"
              element={
                <TeacherRoute>
                  <AdminCourses />
                </TeacherRoute>
              }
            />
            
            <Route
              path="/teacher/manage-courses"
              element={
                <TeacherRoute>
                  <ManageCourses />
                </TeacherRoute>
              }
            />
            
            <Route
              path="/teacher/edit-course/:courseId"
              element={
                <TeacherRoute>
                  <EditCourse />
                </TeacherRoute>
              }
            />
            
            <Route
              path="/teacher/courses/:courseId/modules"
              element={
                <TeacherRoute>
                  <ManageModules />
                </TeacherRoute>
              }
            />
            
            {/* Legacy admin routes - redirect to teacher routes */}
            <Route path="/admin/courses" element={<Navigate to="/teacher/create-course" replace />} />
            <Route path="/admin/manage-courses" element={<Navigate to="/teacher/manage-courses" replace />} />
            <Route path="/admin/courses/edit/:courseId" element={<Navigate to="/teacher/edit-course/:courseId" replace />} />
            
            <Route
              path="/course/:courseId"
              element={
                <PrivateRoute>
                  <CourseDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
