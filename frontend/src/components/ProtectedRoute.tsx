import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  redirectTo?: string;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  isLoggedIn,
  redirectTo = '/login' 
}) => {
  // Nếu chưa login, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu đã login, render children (Layout + nested routes)
  return <>{children}</>;
};

export default ProtectedRoute;