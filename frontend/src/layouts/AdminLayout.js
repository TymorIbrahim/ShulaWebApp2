// src/layouts/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar'; // Adjust path if AdminSidebar.js is elsewhere
// This CSS should contain .admin-dashboard-layout, .admin-main-content, and sidebar styles
import '../pages/AdminDashboard.css'; // Or a more specific path to your admin styles (e.g., ./AdminLayout.css)

const AdminLayout = () => {
    // console.log("[AdminLayout] Rendering AdminLayout with Sidebar and Outlet."); // DEBUG LOG
    return (
        <div className="admin-dashboard-layout"> {/* This class provides the flex container for sidebar + main */}
            <AdminSidebar />
            <main className="admin-main-content"> {/* This class handles margin-right (for RTL) and padding */}
                <Outlet /> {/* Child admin routes (AdminDashboard, ManageProducts, etc.) render here */}
            </main>
        </div>
    );
};

export default AdminLayout; // Make sure this line is present and correct
