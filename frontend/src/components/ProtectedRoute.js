// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ensure path is correct

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // Get auth status from context
  const location = useLocation(); // Get current location

  console.log("ProtectedRoute: isAuthenticated =", isAuthenticated); // Debug log

  // Check if user is authenticated
  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    // Save the location they were trying to access using 'state.from'
    // So login page can redirect back after successful login
    console.log("ProtectedRoute: Not authenticated, redirecting to login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child component defined in the nested Route
  // <Outlet /> renders the matched child route element (e.g., AdminDashboard, ManageProducts)
  console.log("ProtectedRoute: Authenticated, rendering child route.");
  return <Outlet />; 
};

export default ProtectedRoute;