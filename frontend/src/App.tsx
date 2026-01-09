import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './context/ThemeContext';
// Import các page
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword';

import Dashboard from './pages/dashboard/Dashboard'
import ProjectsPage from './pages/projects/ProjectsPage'
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import CalendarPage from './pages/calendar/CalendarPage';
//import Table from './pages/table/Table';
import BoardsPage from './pages/boards/BoardsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ReportsPage from './pages/reports/ReportsPage';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsPage from './pages/settings/SettingsPage';
import UserProfilePage from './pages/profile/UserProfilePage';
// Services
import userAuthService from './services/user/auth.service';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  // Đã login
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = userAuthService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    };
    checkAuth();
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
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        {/*Public routes*/}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={handleRegister} />} />

        {/* ROUTE VERIFY EMAIL */}
        <Route 
          path="/verify-email" 
          element={<VerifyEmail />} 
        />

        {/* ROUTE FORGOT PASSWORD */}
        <Route 
          path="/forgot-password" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <ForgotPassword />} 
        />

        <Route path="/*"
               element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
      <Layout onLogout={handleLogout}>
        <Routes>
            
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<UserProfilePage onLogout={handleLogout} />} />
                      {/* 404 - Redirect to dashboard */}
                      //<Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
                </ProtectedRoute>
               }
          />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  ); 
}

export default App
