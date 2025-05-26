// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

const ProtectedRoute = () => {
  const { user, isAdmin, isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    // Show loading state while auth status is being determined
    return <div>Loading Auth Status...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
