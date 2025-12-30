import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
// Import các page
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import Dashboard from './pages/dashboard/Dashboard'
import ProjectsPage from './pages/projects/ProjectsPage'
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
//import Calendar from './pages/calendar/Calendar';
//import Table from './pages/table/Table';

import ProtectedRoute from './components/ProtectedRoute';

// Services
import userAuthService from './services/user/auth.service';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  // Đã login
  useEffect(() => {
      const authenticated = userAuthService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    }, []);

    // Callback khi login thành công
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Callback khi logout
  const handleLogout = () => {
    userAuthService.logout();
    setIsLoggedIn(false);
  };

  // Callback khi register thành công
  const handleRegister = () => {
    console.log('Registration completed');
  };

  if (loading) {
    return <div>Loading...</div>;
  }
 return (
    <BrowserRouter>
      <Routes>
        {/*Public routes*/}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={handleRegister} />} />

        <Route path="/*"
               element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
      <Layout onLogout={handleLogout}>
        <Routes>
            
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/reports" element={<div>Reports Page</div>} />
          <Route path="/notifications" element={<div>Notifications Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
                      {/* 404 - Redirect to dashboard */}
                      //<Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
                </ProtectedRoute>
               }
          />
      </Routes>
    </BrowserRouter>
  ); 
}

export default App
