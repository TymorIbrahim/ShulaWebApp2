// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth(); // Get user object from context
    const location = useLocation();

    //  Check if the user is authenticated
    const isAuthenticated = !!user;  //  !! converts user object to boolean (true if user exists, false if null)

    console.log("ProtectedRoute: User:", user);
    console.log("ProtectedRoute: isAuthenticated =", isAuthenticated);

    if (!isAuthenticated) {
        console.log("ProtectedRoute: Not authenticated, redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log("ProtectedRoute: Authenticated, rendering child route.");
    return <Outlet />; //  Render the protected component
};

export default ProtectedRoute;