import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
// Import các page
import LoginPage from './pages/auth/LoginPage'
//import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import ProjectsPage from './pages/projects/ProjectsPage'
import MembersPage from './pages/members/MembersPage'
//import Calendar from './pages/calendar/Calendar';
//import Table from './pages/table/Table';


//bỏ import Header from './components/layout/Header/Header';
//import Sidebar from './components/layout/Sidebar/Sidebar';

//type Page = 'dashboard' | 'projects' | 'members';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  //bỏ const [currentPage, setCurrentPage] = useState<Page>('dashboard');

 /*bỏ  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };*/

  const handleLogout = () => {
    setIsAuthenticated(false);
    //Clear tokens, redirect to login, etc
    //bỏ setCurrentPage('dashboard'); // Reset về dashboard khi logout
  };

  /*bỏ const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };*/

  // Chưa login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Đã login
 return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<div>Reports Page</div>} />
          <Route path="/notifications" element={<div>Notifications Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  ); 
}

export default App
/*
<Route path="/projects" element={<ProjectsPage />} /> 
          <Route path="/members" element={<Members />} />
          <Route path="/table" element={<Table />} />
          <Route path="/calendar" element={<Calendar />} />
          */
