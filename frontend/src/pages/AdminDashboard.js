// src/pages/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ensure path is correct
// import './AdminDashboard.css'; // Create CSS for styling

const AdminDashboard = () => {
  const { user, logout } = useAuth(); // Get user info and logout function

  return (
    // Add CSS class for styling
    <div className="admin-dashboard-container"> 
      {/* Display username if available */}
      <h2>Admin Dashboard - Welcome, {user?.username || 'Manager'}!</h2> 
      <p>This is the main admin area. Use the links below to manage the application.</p>
      
      {/* Navigation links for admin sections */}
      <nav className="admin-nav"> 
        <ul>
          <li><Link to="/admin/products">Manage Products</Link></li>
          {/* Add links as you build other sections */}
          {/* <li><Link to="/admin/rentals">Manage Rentals</Link></li> */}
          {/* <li><Link to="/admin/settings">Settings</Link></li> */}
        </ul>
      </nav>

      {/* Logout Button */}
      <button onClick={logout} className="admin-button logout-button"> 
          Logout
      </button> 
    </div>
  );
};

export default AdminDashboard;