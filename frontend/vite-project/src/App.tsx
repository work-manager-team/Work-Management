import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import LoginPage from './components/LoginPage'
import JiraDashboard from './components/JiraDashboard'
import CalendarPage from './components/CalendarPage'
import ReportsPage from './components/ReportsPage'
import NotificationsPage from './components/NotificationsPage'
import SettingsPage from './components/SettingsPage'
import UserProfilePage from './components/UserProfilePage'
import BoardsPage from './components/BoardsPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <Router>
        {isAuthenticated ? (
          <Routes>
            <Route path="/dashboard" element={<JiraDashboard onLogout={handleLogout} />} />
            <Route path="/boards" element={<BoardsPage onLogout={handleLogout} />} />
            <Route path="/calendar" element={<CalendarPage onLogout={handleLogout} />} />
            <Route path="/reports" element={<ReportsPage onLogout={handleLogout} />} />
            <Route path="/notifications" element={<NotificationsPage onLogout={handleLogout} />} />
            <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
            <Route path="/profile" element={<UserProfilePage onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  )
}

export default App