import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import LoginPage from './components/LoginPage'
import JiraDashboard from './components/JiraDashboard'
import CalendarPage from './components/CalendarPage'
import ReportsPage from './components/ReportsPage'
import NotificationsPage from './components/NotificationsPage'
import SettingsPage from './components/SettingsPage'
import UserProfilePage from './components/UserProfilePage'
import BoardsPage from './components/BoardsPage'
import Toast from './components/Toast'
import { useNotification } from './context/NotificationContext'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (accessToken && user) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    // Clear localStorage when logging out
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent isAuthenticated={isAuthenticated} onAuthenticated={setIsAuthenticated} onLogout={handleLogout} />
      </NotificationProvider>
    </ThemeProvider>
  )
}

function AppContent({ isAuthenticated, onAuthenticated, onLogout }: any) {
  const { toasts, removeToast } = useNotification();

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
            duration={5000}
          />
        ))}
      </div>

      <Router>
        {isAuthenticated ? (
          <Routes>
            <Route path="/dashboard" element={<JiraDashboard onLogout={onLogout} />} />
            <Route path="/boards" element={<BoardsPage onLogout={onLogout} />} />
            <Route path="/calendar" element={<CalendarPage onLogout={onLogout} />} />
            <Route path="/reports" element={<ReportsPage onLogout={onLogout} />} />
            <Route path="/notifications" element={<NotificationsPage onLogout={onLogout} />} />
            <Route path="/settings" element={<SettingsPage onLogout={onLogout} />} />
            <Route path="/profile" element={<UserProfilePage onLogout={onLogout} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={() => onAuthenticated(true)} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
    </>
  );
}

export default App