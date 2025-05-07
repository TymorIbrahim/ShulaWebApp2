import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css'; // Create this CSS file

const AdminDashboard = () => {
    const { user, logoutUser } = useAuth();

    if (!user || user.role !== 'staff') {
        return <div>Access Denied</div>; // Or redirect
    }

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <p>Welcome, {user.firstName}!</p>
            <nav>
                <Link to="/admin/products">Manage Products</Link> <br/>
                <Link to="/admin/users">Manage Users</Link> <br/>
                <Link to="/admin/analytics">Analytics Dashboard</Link>
                <Link to="/admin/settings">Admin Settings</Link>
                <button onClick={logoutUser}>Logout</button>
            </nav>
        </div>
    );
};

export default AdminDashboard;