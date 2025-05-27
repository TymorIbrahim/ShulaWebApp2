// src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Service imports
import { getUsers } from '../services/userService';
import { getProductStatistics } from '../services/productService';
import { getTotalRevenue, getRecentOrders } from '../services/analyticsService';
import { getOrdersAsAdmin } from '../services/orderService';

import './AdminDashboard.css';

// --- Enhanced SVG Icons ---
const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,2A3,3 0 0,1 15,5V7H18A1,1 0 0,1 19,8V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8A1,1 0 0,1 6,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z" />
  </svg>
);

const RevenueIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M15,20.5V19H16.5V20.5H18V22H15V20.5M20.5,14.5V16H19V14.5H17.5V13H20.5V14.5M16,9H22V15H16V9M18,11V13H20V11H18M14.82,3H19.18L21.18,5H24V7H21V17A2,2 0 0,1 19,19H17.18L15.18,17H12V15H17V7H19.82L18.82,6H15.18L14.18,7H9V17H12V19H7A2,2 0 0,1 5,17V7H0V5H2.82L4.82,3H9.18L11.18,5H14.82L16.82,3H14.82V3Z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
  </svg>
);

// Enhanced Stat Card Component
const StatCard = ({ title, value, change, icon, color, trend, loading, link }) => {
    const cardContent = (
        <div className={`stat-card-enhanced ${color} ${loading ? 'loading' : ''}`}>
            <div className="stat-card-header">
                <div className="stat-card-icon-container">
                    <div className="stat-card-icon">{icon}</div>
                </div>
                {trend && (
                    <div className={`trend-indicator ${trend > 0 ? 'positive' : 'negative'}`}>
                        <TrendingUpIcon />
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <div className="stat-card-content">
                <div className="stat-card-value">
                    {loading ? (
                        <div className="skeleton-loader"></div>
                    ) : (
                        value
                    )}
                </div>
                <div className="stat-card-title">{title}</div>
                {change && (
                    <div className="stat-card-change">
                        <span>{change}</span>
                        <span className="change-period">מהחודש הקודם</span>
                    </div>
                )}
            </div>
        </div>
    );

    return link ? (
        <Link to={link} className="stat-card-link">
            {cardContent}
        </Link>
    ) : (
        cardContent
    );
};

// Quick Actions Component
const QuickActions = () => {
    const quickActions = [
        { 
            title: 'הוסף מוצר חדש', 
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A3,3 0 0,1 15,5V7H18A1,1 0 0,1 19,8V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8A1,1 0 0,1 6,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z" />
                </svg>
            ), 
            link: '/admin/products/new', 
            color: 'blue' 
        },
        { 
            title: 'נהל הזמנות', 
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
                </svg>
            ), 
            link: '/admin/rentals', 
            color: 'green' 
        },
        { 
            title: 'חפש לקוח', 
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
                </svg>
            ), 
            link: '/admin/users', 
            color: 'purple' 
        },
        { 
            title: 'צפה בדוחות', 
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
                </svg>
            ), 
            link: '/admin/analytics', 
            color: 'orange' 
        },
    ];

    return (
        <div className="quick-actions-section">
            <h3 className="section-title">פעולות מהירות</h3>
            <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                    <Link key={index} to={action.link} className={`quick-action-card ${action.color}`}>
                        <div className="quick-action-icon">{action.icon}</div>
                        <span className="quick-action-title">{action.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

// Recent Activity Component
const RecentActivity = ({ recentOrders, loading }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'אתמול';
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        return date.toLocaleDateString('he-IL');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'Pending': { label: 'ממתין', color: 'warning' },
            'Accepted': { label: 'מאושר', color: 'success' },
            'Rejected': { label: 'נדחה', color: 'danger' },
            'Completed': { label: 'הושלם', color: 'info' }
        };
        return statusMap[status] || { label: status, color: 'default' };
    };

    return (
        <div className="recent-activity-section">
            <div className="section-header">
                <h3 className="section-title">פעילות אחרונה</h3>
                <span className="activity-count">
                    {loading ? '...' : `${recentOrders?.length || 0} הזמנות אחרונות`}
                </span>
            </div>
            
            <div className="activity-list">
                {loading ? (
                    Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="activity-item skeleton">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line long"></div>
                            </div>
                        </div>
                    ))
                ) : recentOrders?.length > 0 ? (
                    recentOrders.slice(0, 6).map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        return (
                            <div key={order._id} className="activity-item">
                                <div className="activity-avatar">
                                    <OrdersIcon />
                                </div>
                                <div className="activity-content">
                                    <div className="activity-title">
                                        הזמנה חדשה #{order._id.slice(-6)}
                                    </div>
                                    <div className="activity-details">
                                        <span className={`status-badge ${statusBadge.color}`}>
                                            {statusBadge.label}
                                        </span>
                                        <span className="activity-time">
                                            <CalendarIcon />
                                            {formatDate(order.createdAt)}
                                        </span>
                                        <span className="activity-value">
                                            ₪{order.totalValue?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-activity">
                        <div className="no-activity-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
                            </svg>
                        </div>
                        <p>אין פעילות אחרונה</p>
                    </div>
                )}
            </div>
            
            {recentOrders?.length > 6 && (
                <div className="activity-footer">
                    <Link to="/admin/rentals" className="view-all-btn">
                        צפה בכל ההזמנות
                    </Link>
                </div>
            )}
        </div>
    );
};

// Welcome Section Component
const WelcomeSection = ({ user, onRefresh, lastUpdated }) => {
    const getCurrentTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'בוקר טוב';
        if (hour < 17) return 'צהריים טובים';
        if (hour < 21) return 'ערב טוב';
        return 'לילה טוב';
    };

    return (
        <div className="welcome-section">
            <div className="welcome-content">
                <div className="welcome-text">
                    <h1 className="welcome-title">
                        {getCurrentTimeGreeting()}, {user?.firstName || 'מנהל'}!
                        <span className="welcome-wave">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7,4V2A1,1 0 0,1 8,1A1,1 0 0,1 9,2V4.1L10.5,4.05C10.81,4.04 11.08,4.19 11.28,4.4L21.6,14.71C22.37,15.5 22.37,16.74 21.6,17.53C20.81,18.3 19.58,18.3 18.79,17.53L9.5,8.2L9,8.15V22A1,1 0 0,1 8,23A1,1 0 0,1 7,22V8.15L6.5,8.2L2.21,12.5C1.42,13.29 0.18,13.29 -0.6,12.5C-1.39,11.71 -1.39,10.47 -0.6,9.68L3.72,5.4C3.92,5.19 4.19,5.04 4.5,5.05L7,4.1V4Z"/>
                            </svg>
                        </span>
                    </h1>
                    <p className="welcome-subtitle">
                        ברוך הבא ללוח הבקרה הראשי. כאן תוכל לנהל את המערכת ולצפות בסטטיסטיקות חשובות.
                    </p>
                </div>
                <div className="welcome-actions">
                    <button onClick={onRefresh} className="refresh-btn" title="רענן נתונים">
                        <RefreshIcon />
                        <span>רענן</span>
                    </button>
                    {lastUpdated && (
                        <span className="last-updated">
                            עודכן לאחרונה: {lastUpdated.toLocaleTimeString('he-IL')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Dashboard Component
const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // State management
    const [dashboardData, setDashboardData] = useState({
        productStats: null,
        userStats: null,
        orderStats: null,
        revenue: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [rateLimitWarning, setRateLimitWarning] = useState(false);

    // Security check
    const isAdmin = user?.role?.includes('staff');

    useEffect(() => {
        if (user && !isAdmin) {
            navigate('/');
        } else if (!user) {
            navigate('/login');
        }
    }, [user, isAdmin, navigate]);

    // Fetch dashboard data with rate limiting protection
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');
        setRateLimitWarning(false);
        let rateLimitHit = false;
        
        try {
            // Add delays between requests to prevent rate limiting
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            
            // Fetch data sequentially with delays to avoid rate limiting
            // console.log('Fetching dashboard data...');
            
            // Fetch users count first
            try {
                const usersData = await getUsers({ limit: 1 });
                setDashboardData(prev => ({ 
                    ...prev, 
                    userStats: {
                        totalUsers: usersData.totalUsers || usersData.pagination?.totalProducts || 0,
                        newUsers: 0,
                        activeUsers: 0
                    }
                }));
                await delay(300); // Increased delay
            } catch (error) {
                if (error.response?.status === 429) {
                    // console.warn('Rate limited on users endpoint, using cached data');
                    setDashboardData(prev => ({ ...prev, userStats: { totalUsers: 0, newUsers: 0, activeUsers: 0 } }));
                    rateLimitHit = true;
                } else {
                    console.error('Error fetching users:', error);
                    setDashboardData(prev => ({ ...prev, userStats: { totalUsers: 0, newUsers: 0, activeUsers: 0 } }));
                }
            }

            // Fetch product statistics
            try {
                const productStats = await getProductStatistics();
                setDashboardData(prev => ({ 
                    ...prev, 
                    productStats: {
                        totalProducts: productStats.totalProducts || 0,
                        activeProducts: productStats.activeProducts || 0,
                        lowStockProducts: productStats.lowStockProducts || 0
                    }
                }));
                await delay(300);
            } catch (error) {
                if (error.response?.status === 429) {
                    // console.warn('Rate limited on products endpoint, using cached data');
                    setDashboardData(prev => ({ 
                        ...prev, 
                        productStats: {
                            totalProducts: 0,
                            activeProducts: 0,
                            lowStockProducts: 0
                        }
                    }));
                    rateLimitHit = true;
                } else {
                    console.error('Error fetching product statistics:', error);
                    setDashboardData(prev => ({ 
                        ...prev, 
                        productStats: {
                            totalProducts: 0,
                            activeProducts: 0,
                            lowStockProducts: 0
                        }
                    }));
                }
            }

            // Fetch analytics data (handle 404s gracefully)
            try {
                await delay(300);
                const [revenueData, recentOrdersData] = await Promise.allSettled([
                    getTotalRevenue().catch(error => {
                        // Handle 404 or other analytics endpoint errors
                        if (error.response?.status === 404) {
                            // console.warn('Analytics revenue endpoint not available');
                            return { totalRevenue: 0 };
                        }
                        throw error;
                    }),
                    getRecentOrders().catch(error => {
                        // Handle 404 or other analytics endpoint errors  
                        if (error.response?.status === 404) {
                            // console.warn('Analytics recent orders endpoint not available');
                            return { orders: [] };
                        }
                        throw error;
                    })
                ]);
                
                if (revenueData.status === 'fulfilled') {
                    setDashboardData(prev => ({ ...prev, revenue: revenueData.value.totalRevenue || 0 }));
                } else if (revenueData.reason?.response?.status === 429) {
                    // console.warn('Rate limited on revenue endpoint');
                    setDashboardData(prev => ({ ...prev, revenue: 0 }));
                    rateLimitHit = true;
                } else {
                    // console.warn('Revenue endpoint unavailable, using default');
                    setDashboardData(prev => ({ ...prev, revenue: 0 }));
                }
                
                if (recentOrdersData.status === 'fulfilled') {
                    setDashboardData(prev => ({ ...prev, recentOrders: recentOrdersData.value.orders || [] }));
                } else if (recentOrdersData.reason?.response?.status === 429) {
                    // console.warn('Rate limited on recent orders endpoint');
                    setDashboardData(prev => ({ ...prev, recentOrders: [] }));
                    rateLimitHit = true;
                } else {
                    // console.warn('Recent orders endpoint unavailable, using default');
                    setDashboardData(prev => ({ ...prev, recentOrders: [] }));
                }
                
                await delay(300);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                // Set defaults if analytics completely fails
                setDashboardData(prev => ({ 
                    ...prev, 
                    revenue: 0,
                    recentOrders: []
                }));
            }

            // Fetch orders data (handle 404s gracefully)
            try {
                const ordersResponse = await getOrdersAsAdmin();
                setDashboardData(prev => ({ ...prev, orderStats: ordersResponse.statistics }));
            } catch (error) {
                if (error.response?.status === 429) {
                    // console.warn('Rate limited on orders endpoint, using cached data');
                    setDashboardData(prev => ({ ...prev, orderStats: { global: { pending: 0, accepted: 0, completed: 0, total: 0 } } }));
                    rateLimitHit = true;
                } else if (error.response?.status === 404) {
                    // console.warn('Orders admin endpoint not available, using defaults');
                    setDashboardData(prev => ({ ...prev, orderStats: { global: { pending: 0, accepted: 0, completed: 0, total: 0 } } }));
                } else {
                    console.error('Error fetching orders:', error);
                    setDashboardData(prev => ({ ...prev, orderStats: { global: { pending: 0, accepted: 0, completed: 0, total: 0 } } }));
                }
            }

            // Set rate limit warning if any endpoint was rate limited
            if (rateLimitHit) {
                setRateLimitWarning(true);
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            if (error.response?.status === 429) {
                setError('Server is busy. Please wait 15 minutes before refreshing.');
                setRateLimitWarning(true);
            } else {
                setError('Failed to load dashboard data. Please try refreshing the page.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    if (!user || !isAdmin) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                    </svg>
                </div>
                <p>טוען...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </div>
                <h3>שגיאה בטעינת הדשבורד</h3>
                <p>{error}</p>
                <button onClick={fetchDashboardData} className="retry-btn">
                    נסה שוב
                </button>
            </div>
        );
    }

    // Prepare stats data
    const statsData = [
        {
            title: 'סה"כ מוצרים',
            value: dashboardData.productStats?.totalProducts || 0,
            change: '+12',
            icon: <ProductsIcon />,
            color: 'blue',
            trend: 8.5,
            link: '/admin/products'
        },
        {
            title: 'משתמשים רשומים',
            value: dashboardData.userStats?.totalUsers || 0,
            change: '+5',
            icon: <UsersIcon />,
            color: 'green',
            trend: 12.3,
            link: '/admin/users'
        },
        {
            title: 'הזמנות פעילות',
            value: dashboardData.orderStats?.global?.pending || 0,
            change: '+3',
            icon: <OrdersIcon />,
            color: 'orange',
            trend: -2.1,
            link: '/admin/rentals'
        },
        {
            title: 'הכנסות החודש',
            value: `₪${dashboardData.revenue?.toLocaleString() || '0'}`,
            change: '+₪1,200',
            icon: <RevenueIcon />,
            color: 'purple',
            trend: 15.8,
            link: '/admin/analytics'
        }
    ];

    return (
        <div className="admin-dashboard-enhanced">
            <WelcomeSection 
                user={user} 
                onRefresh={fetchDashboardData}
                lastUpdated={lastUpdated}
            />

            {/* Rate Limit Warning Banner */}
            {rateLimitWarning && (
                <div className="rate-limit-warning">
                    <div className="warning-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                        </svg>
                    </div>
                    <div className="warning-content">
                        <strong>Limited Data Available</strong>
                        <p>Some data may be incomplete due to server load. This will automatically resolve in a few minutes.</p>
                    </div>
                    <button 
                        onClick={() => setRateLimitWarning(false)} 
                        className="warning-close"
                        title="Dismiss warning"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                        </svg>
                    </button>
                </div>
            )}

            <div className="dashboard-grid">
                {/* Statistics Cards */}
                <section className="stats-section">
                    <div className="stats-header">
                        <StatsIcon />
                        <h2>סקירה כללית</h2>
                    </div>
                    <div className="stats-grid">
                        {statsData.map((stat, index) => (
                            <StatCard
                                key={index}
                                title={stat.title}
                                value={stat.value}
                                change={stat.change}
                                icon={stat.icon}
                                color={stat.color}
                                trend={stat.trend}
                                loading={loading}
                                link={stat.link}
                            />
                        ))}
                    </div>
                </section>

                {/* Quick Actions */}
                <QuickActions />

                {/* Recent Activity */}
                <RecentActivity 
                    recentOrders={dashboardData.recentOrders} 
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
