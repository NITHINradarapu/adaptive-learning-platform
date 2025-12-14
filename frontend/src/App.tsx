import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import AdminCourses from './pages/Admin/AdminCourses';
import ManageCourses from './pages/Admin/ManageCourses';
import EditCourse from './pages/Admin/EditCourse';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar />}
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/video/:videoId"
              element={
                <PrivateRoute>
                  <VideoPlayer />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/courses"
              element={
                <PrivateRoute>
                  <AdminCourses />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/manage-courses"
              element={
                <PrivateRoute>
                  <ManageCourses />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/courses/edit/:courseId"
              element={
                <PrivateRoute>
                  <EditCourse />
                </PrivateRoute>
              }
            />
            
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
