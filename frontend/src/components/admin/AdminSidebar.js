// src/components/admin/AdminSidebar.js
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path if AuthContext is elsewhere
// Assuming AdminDashboard.css contains the sidebar styles, or you can create a dedicated AdminSidebar.css
import '../../pages/AdminDashboard.css'; // Or a more specific path to your admin styles

// --- SVG Icons (Copied from your AdminDashboard for self-containment) ---
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M13 3V9H21V3M13 21H21V11H13M3 21H11V15H3M3 13H11V3H3V13Z" />
  </svg>
);
const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M9.5,4A1.5,1.5 0 0,0 8,5.5V6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H20A1,1 0 0,0 21,17V7A1,1 0 0,0 20,6H16V5.5A1.5,1.5 0 0,0 14.5,4H9.5M9.5,5H14.5A0.5,0.5 0 0,1 15,5.5V6H9V5.5A0.5,0.5 0 0,1 9.5,5M5,7H19V10H5V7M5,11H19V16H5V11M11,12V15H13V12H11Z" />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" />
  </svg>
);
const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M9,17H7V10H9M13,17H11V7H13M17,17H15V13H17M19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3Z" />
  </svg>
);
const RentalsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M4 6H2V20C2 21.11 2.9 22 4 22H18V20H4V6M20 2H8C6.9 2 6 2.9 6 4V16C6 17.11 6.9 18 8 18H20C21.11 18 22 17.11 22 16V4C22 2.9 21.11 2 20 2M17 14H15V11H12V14H10V9H12V11.5H15V9H17V14Z" />
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
  </svg>
);
// --- End SVG Icons ---

const AdminSidebar = () => {
    const { logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/'); // Navigate to public home page after logout
    };

    // Navigation items for the sidebar - Translated to Hebrew
    const navItems = [
        { path: "/admin", label: "לוח ראשי", icon: <DashboardIcon /> },
        { path: "/admin/products", label: "ניהול מלאי ומוצרים", icon: <ProductsIcon /> },
        { path: "/admin/rentals", label: "ניהול השכרות", icon: <RentalsIcon /> },
        { path: "/admin/users", label: "ניהול לקוחות", icon: <UsersIcon /> },
        { path: "/admin/analytics", label: "דוחות וניתוחים", icon: <AnalyticsIcon /> },
        { path: "/admin/settings", label: "הגדרות מערכת", icon: <SettingsIcon /> },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <Link to="/admin" className="sidebar-logo-link">
                    <span className="sidebar-logo">שולה ADMIN</span>
                </Link>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/admin"}
                        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
                    >
                        <span>{item.label}</span>
                        {item.icon} {/* Icon on the left for RTL */}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-item logout-button" aria-label="התנתקות">
                    <span>התנתק</span>
                    <LogoutIcon />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
