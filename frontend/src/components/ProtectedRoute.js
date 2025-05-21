// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

const ProtectedRoute = () => {
  const { user, isAdmin, isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  console.log("####################################");
  console.log("[PROTECTED_ROUTE_V5] Checking access for path:", location.pathname);
  console.log("[PROTECTED_ROUTE_V5] authReady from useAuth:", authReady);
  console.log("[PROTECTED_ROUTE_V5] User object from useAuth:", JSON.stringify(user, null, 2));
  console.log("[PROTECTED_ROUTE_V5] isAuthenticated from useAuth:", isAuthenticated);
  console.log("[PROTECTED_ROUTE_V5] isAdmin from useAuth:", isAdmin);
  console.log("####################################");

  if (!authReady) {
    console.log("[PROTECTED_ROUTE_V5] Auth not ready. Rendering loading state (or null).");
    // You might want to show a loading spinner or return null
    // to prevent premature redirects before auth status is known.
    return <div>Loading Auth Status...</div>; // Or return null;
  }

  if (!isAuthenticated) {
    console.log("[PROTECTED_ROUTE_V5] Auth ready. User not authenticated. Redirecting to /login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log("[PROTECTED_ROUTE_V5] Auth ready. User authenticated but NOT an admin. Redirecting to /.");
    return <Navigate to="/" replace />;
  }

  console.log("[PROTECTED_ROUTE_V5] Auth ready. User is authenticated AND an admin. Allowing access to <Outlet /> for path:", location.pathname);
  return <Outlet />;
};

export default ProtectedRoute;
