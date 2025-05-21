// src/pages/HomePage.js
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path if AuthContext.js is elsewhere
import HeroSection from '../components/HeroSection'; // Adjust path to your HeroSection component

const HomePage = () => {
  // Get authReady and isAuthenticated to manage loading state if needed
  // user and isAdmin are not strictly necessary here if this page always shows public content
  const { isAuthenticated, authReady } = useAuth();

  // console.log("[HOME_PAGE_V7] Rendering. authReady:", authReady, "isAuthenticated:", isAuthenticated);

  // If authReady is false and the user isn't already known to be authenticated
  // (e.g., from a quick localStorage check if your AuthContext does that),
  // you might want to show a loading indicator.
  // This prevents the HeroSection from appearing briefly if auth is still initializing
  // and the user might be an admin who should have been redirected.
  // However, if LoginPage handles all admin redirection, this might be less critical.
  if (authReady === false && !isAuthenticated) {
    // console.log("[HOME_PAGE_V7] Auth not ready AND not authenticated. Rendering loading state.");
    // You can return a more styled loading component or a simple div
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>טוען...</div>; // "Loading..." in Hebrew
  }

  // This page (at path '/') will now always show the HeroSection or equivalent customer view.
  // Admins should have been redirected to /admin by LoginPage.js.
  // console.log("[HOME_PAGE_V7] Auth ready or user authenticated. Rendering HeroSection.");
  return <HeroSection />;
};

export default HomePage; // Ensure this default export is present and correct
