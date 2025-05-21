// src/pages/AdminDashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
import './AdminDashboard.css'; // Styles for this component (uses admin_dashboard_css_ultra_premium_rtl)

// --- SVG Icons (Only those used directly on this page's content) ---
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
// --- End SVG Icons ---

// --- Reusable Sub-Components ---
const StatCard = ({ title, value, icon, color, link }) => (
    link ? (
        <Link to={link} className={`stat-card stat-card-${color} stat-card-linkable`}>
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-info">
                <p className="stat-card-title">{title}</p>
                <p className="stat-card-value">{value}</p>
            </div>
        </Link>
    ) : (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-card-icon">{icon}</div>
            <div className="stat-card-info">
                <p className="stat-card-title">{title}</p>
                <p className="stat-card-value">{value}</p>
            </div>
        </div>
    )
);

const DashboardSection = ({ title, children }) => (
    <section className="dashboard-section">
        <h2>{title}</h2>
        {children}
    </section>
);
// --- End Reusable Sub-Components ---


const AdminDashboard = () => {
    const { user } = useAuth(); // Only need user for the welcome message
    const navigate = useNavigate();

    // Local isAdmin check for safety, though ProtectedRoute is the primary guard
    // for the /admin route and its children (which includes AdminLayout -> AdminDashboard)
    const isAdmin = user &&
                    user.role &&
                    typeof user.role.includes === 'function' &&
                    user.role.includes('staff');

    React.useEffect(() => {
        // This effect ensures that if, for some reason, a non-admin user object
        // is present when this component mounts (e.g., state inconsistency),
        // it navigates away. ProtectedRoute should prevent this scenario for the /admin path.
        if (user && !isAdmin) {
            console.warn("AdminDashboard (Content Only): User is present but not admin. This should ideally be caught by ProtectedRoute. Navigating to home.");
            navigate('/');
        } else if (!user) {
            // If no user is found (e.g., after logout and somehow landing here, or auth still init),
            // ProtectedRoute should have redirected to login.
            console.warn("AdminDashboard (Content Only): No user. This should be caught by ProtectedRoute. Navigating to login.");
            navigate('/login');
        }
    }, [user, isAdmin, navigate]);

    // If the user is not yet available or not an admin, render nothing (or a loader)
    // while the useEffect handles navigation.
    if (!user || !isAdmin) {
        return null; // Or <div className="admin-dashboard-loading">טוען...</div>;
    }

    // Data for the statistics cards - Translated to Hebrew
    const statsData = [
        { title: "סה\"כ מוצרים", value: "210+", icon: <ProductsIcon />, color: "blue", link: "/admin/products" },
        { title: "משתמשים רשומים", value: "150+", icon: <UsersIcon />, color: "green", link: "/admin/users" },
        { title: "השכרות ממתינות לאישור", value: "12", icon: <RentalsIcon />, color: "orange", link: "/admin/rentals" },
        { title: "הכנסות (חודשי)", value: "₪12,300", icon: <AnalyticsIcon />, color: "purple", link: "/admin/analytics" },
    ];

    return (
        <> {/* This component now returns a React Fragment as the outer layout is handled by AdminLayout */}
            <header className="main-content-header">
                <h1>לוח בקרה ראשי</h1>
                <div className="header-user-info">
                    ברוך הבא, {user?.firstName || 'מנהל'}!
                </div>
            </header>

            <section className="stat-cards-grid">
                {statsData.map((stat) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        link={stat.link}
                    />
                ))}
            </section>

            <DashboardSection title="פעילות אחרונה במערכת">
                <div className="placeholder-content">
                    <p>כאן יוצג סיכום של הפעולות האחרונות שבוצעו, כגון השכרות חדשות, מוצרים שנוספו, או הודעות חשובות.</p>
                    <p>לדוגמה: רשימת ההשכרות האחרונות, לקוחות חדשים שנרשמו החודש, פריטים שהמלאי שלהם נמוך.</p>
                </div>
            </DashboardSection>

            <DashboardSection title="קיצורי דרך">
                <div className="quick-actions-grid">
                    <Link to="/admin/products/new" className="quick-action-button">
                        הוספת מוצר חדש
                    </Link>
                    <Link to="/admin/users" className="quick-action-button">
                        חיפוש לקוח
                    </Link>
                    <Link to="/admin/rentals" className="quick-action-button">
                        טיפול בהשכרות פתוחות
                    </Link>
                </div>
            </DashboardSection>
        </>
    );
};

export default AdminDashboard;
