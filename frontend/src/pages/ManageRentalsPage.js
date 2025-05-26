// src/pages/ManageRentalsPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrdersAsAdmin, updateOrderStatusAsAdmin } from '../services/orderService';
import MembershipModal from '../components/admin/MembershipModal';
import './ManageRentalsPage.css'; 

// --- SVG Icons ---
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z" />
  </svg>
);
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
  </svg>
);
const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
  </svg>
);
const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
  </svg>
);
const CollapseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />
  </svg>
);
const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
  </svg>
);
const IdIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M2,3H22C23.05,3 24,3.95 24,5V19C24,20.05 23.05,21 22,21H2C0.95,21 0,20.05 0,19V5C0,3.95 0.95,3 2,3M14,6V7H22V6H14M14,8V9H21.5L22,9V8H14M14,10V11H21V10H14M8,13.91C6,13.91 2,15 2,17V18H14V17C14,15 10,13.91 8,13.91M8,6A3,3 0 0,0 5,9A3,3 0 0,0 8,12A3,3 0 0,0 11,9A3,3 0 0,0 8,6Z" />
  </svg>
);
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" />
  </svg>
);
const ContactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
  </svg>
);
// --- End SVG Icons ---

// Helper to normalize orders - handle both old and new structures
const normalizeOrder = (order) => {
    // If order already has items array (new structure), return as is
    if (order.items && Array.isArray(order.items)) {
        return order;
    }
    
    // If order has old structure (single product and rentalPeriod), convert to new structure
    if (order.product && order.rentalPeriod) {
        return {
            ...order,
            items: [{
                product: order.product,
                rentalPeriod: order.rentalPeriod
            }]
        };
    }
    
    // Fallback for invalid orders
    return {
        ...order,
        items: []
    };
};

// Helper to check if order is currently ongoing
const isOrderOngoing = (order) => {
    if (order.status !== 'Accepted' || !order.items?.length) {
        return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    return order.items.some(item => {
        if (!item.rentalPeriod?.startDate || !item.rentalPeriod?.endDate) {
            return false;
        }
        
        const startDate = new Date(item.rentalPeriod.startDate);
        const endDate = new Date(item.rentalPeriod.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        return today >= startDate && today <= endDate;
    });
};

// Helper to format dates - DD/MM/YYYY
const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'תאריך לא תקין';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'שגיאת תאריך';
    }
};

// Helper to get relative time (e.g., "2 hours ago")
const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 5) return 'זה עתה';
        if (diffMins < 60) return `לפני ${diffMins} דקות`;
        if (diffHours < 24) return `לפני ${diffHours} שעות`;
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
        return formatDate(dateString);
    } catch (error) {
        return formatDate(dateString);
    }
};

// Helper to get days until rental starts
const getDaysUntilStart = (order) => {
    if (!order.items?.length) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const earliestStart = Math.min(
        ...order.items
            .map(item => new Date(item.rentalPeriod?.startDate))
            .filter(date => !isNaN(date.getTime()))
    );
    
    if (isNaN(earliestStart)) return null;
    
    const startDate = new Date(earliestStart);
    startDate.setHours(0, 0, 0, 0);
    
    const diffTime = startDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
};

// Statistics Component - now using API-provided statistics
const OrderStatistics = ({ statistics }) => {
    // Use global statistics from the API for the main dashboard stats
    const stats = statistics?.global || {
        pending: 0, accepted: 0, rejected: 0, ongoing: 0,
        total: 0, totalItems: 0, revenue: 0, avgItemsPerOrder: 0
    };

    return (
        <div className="order-statistics premium">
            <div className="stats-header">
                <div className="stats-icon">
                    <StatsIcon />
                </div>
                <div className="stats-title-section">
                    <h3>סקירה כללית</h3>
                    <p>נתונים עדכניים על המערכת</p>
                </div>
            </div>
            <div className="stats-grid premium">
                <div className="stat-card total">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">סה"כ הזמנות</div>
                        <div className="stat-trend">במערכת</div>
                    </div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.pending}</div>
                        <div className="stat-label">ממתינות לטיפול</div>
                        <div className="stat-trend">דורש פעולה</div>
                    </div>
                </div>
                <div className="stat-card ongoing">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.ongoing}</div>
                        <div className="stat-label">השכרות פעילות</div>
                        <div className="stat-trend">כרגע מושכרות</div>
                    </div>
                </div>
                <div className="stat-card revenue">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <div className="stat-number">₪{stats.revenue.toLocaleString()}</div>
                        <div className="stat-label">הכנסות מאושרות</div>
                        <div className="stat-trend">מכל ההזמנות</div>
                    </div>
                </div>
                <div className="stat-card accepted">
                    <div className="stat-content">
                        <div className="stat-number">{stats.accepted}</div>
                        <div className="stat-label">מאושרות</div>
                        <div className="stat-trend">הושלמו</div>
                    </div>
                </div>
                <div className="stat-card items">
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalItems}</div>
                        <div className="stat-label">פריטים בסך הכל</div>
                        <div className="stat-trend">{stats.avgItemsPerOrder} ממוצע</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Search Bar Component - now triggers server-side search
const SearchBar = ({ 
    searchText, 
    onSearchTextChange, 
    onQuickFilter,
    activeQuickFilter,
    hasActiveFilters,
    onClearAllFilters,
    onSearchEnter
}) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearchEnter();
        }
    };

    return (
        <div className="enhanced-search-bar premium">
            <div className="search-section">
                <div className="search-title">
                    <SearchIcon />
                    <h4>חיפוש חכם</h4>
                </div>
                <div className="search-input-container">
                    <div className="search-input-wrapper premium">
                        <input
                            type="text"
                            placeholder="חפש לפי שם לקוח, מייל, טלפון, מוצר או מזהה..."
                            value={searchText}
                            onChange={(e) => onSearchTextChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="search-input premium"
                        />
                        {searchText && (
                            <button 
                                onClick={() => onSearchTextChange('')} 
                                className="clear-search-btn premium"
                                title="נקה חיפוש"
                            >
                                <ClearIcon />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="filters-section">
                <div className="filters-title">
                    <FilterIcon />
                    <h4>פילטרים מהירים</h4>
                </div>
                <div className="quick-filters premium">
                    <button 
                        onClick={() => onQuickFilter('today')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'today' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">📅</span>
                        <span className="filter-text">היום</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('pending')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'pending' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">⏳</span>
                        <span className="filter-text">ממתינות</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('ongoing')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'ongoing' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">🔄</span>
                        <span className="filter-text">פעילות</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('urgent')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'urgent' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">🚨</span>
                        <span className="filter-text">דחוף</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('recent')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'recent' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">🕒</span>
                        <span className="filter-text">השבוע</span>
                    </button>
                </div>
                {hasActiveFilters && (
                    <button onClick={onClearAllFilters} className="clear-all-btn premium">
                        <ClearIcon />
                        <span>נקה כל הפילטרים</span>
                    </button>
                )}
            </div>
        </div>
    );
};

// Pagination Component
const PaginationControls = ({ paginationData, onPageChange }) => {
    if (!paginationData || paginationData.totalPages <= 1) {
        return null;
    }

    const { currentPage, totalPages, hasNextPage, hasPrevPage, totalOrders, pageSize } = paginationData;
    
    // Calculate showing range
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = Math.min(currentPage * pageSize, totalOrders);
    
    // Generate page numbers to show
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="pagination-controls premium">
            <div className="pagination-info">
                <span>מציג {startItem}-{endItem} מתוך {totalOrders} הזמנות</span>
            </div>
            
            <div className="pagination-buttons">
                <button 
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="pagination-btn prev"
                    title="עמוד קודם"
                >
                    <ChevronRightIcon />
                    קודם
                </button>
                
                <div className="page-numbers">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={index} className="pagination-dots">...</span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => onPageChange(page)}
                                className={`pagination-btn page-btn ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>
                
                <button 
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="pagination-btn next"
                    title="עמוד הבא"
                >
                    הבא
                    <ChevronLeftIcon />
                </button>
            </div>
        </div>
    );
};

// Order Card Component - Modern Premium Design
const OrderCard = ({ 
    order, 
    onToggleExpand, 
    isExpanded, 
    onAccept, 
    onReject, 
    onShowCustomerContact,
    onShowOrderId,
    onShowMembership
}) => {
    const normalizedOrder = normalizeOrder(order);
    console.log('Normalized order:', normalizedOrder);
    
    const customerName = normalizedOrder.user ? 
        `${normalizedOrder.user.firstName || ''} ${normalizedOrder.user.lastName || ''}`.trim() || normalizedOrder.user.email 
        : 'לקוח לא ידוע';

    // Get membership status
    const getMembershipStatus = () => {
        const membership = normalizedOrder.user?.membership;
        if (!membership?.isMember) {
            return { status: 'not-member', label: 'לא חבר', icon: '⚠️', color: '#f39c12' };
        }
        
        if (membership.membershipType === 'online') {
            if (membership.idVerification?.verified) {
                return { status: 'verified', label: 'חבר מאומת', icon: '✅', color: '#27ae60' };
            } else {
                return { status: 'pending', label: 'ממתין לאימות', icon: '⏳', color: '#f39c12' };
            }
        } else if (membership.membershipType === 'in_person') {
            return { status: 'in-person', label: 'חבר במקום', icon: '🏢', color: '#8e44ad' };
        }
        
        return { status: 'unknown', label: 'סטטוס לא ידוע', icon: '❓', color: '#95a5a6' };
    };

    const membershipStatus = getMembershipStatus();

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': 
                return { 
                    bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', 
                    color: '#ea580c', 
                    border: '#fb923c',
                    label: 'ממתין לאישור',
                    icon: '⏳',
                    shadowColor: 'rgba(251, 146, 60, 0.3)'
                };
            case 'accepted': 
                return { 
                    bg: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)', 
                    color: '#16a34a', 
                    border: '#22c55e',
                    label: 'מאושר',
                    icon: '✅',
                    shadowColor: 'rgba(34, 197, 94, 0.3)'
                };
            case 'rejected': 
                return { 
                    bg: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', 
                    color: '#dc2626', 
                    border: '#f87171',
                    label: 'נדחה',
                    icon: '❌',
                    shadowColor: 'rgba(248, 113, 113, 0.3)'
                };
            default: 
                return { 
                    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                    color: '#64748b', 
                    border: '#cbd5e1',
                    label: 'לא ידוע',
                    icon: '❓',
                    shadowColor: 'rgba(203, 213, 225, 0.3)'
                };
        }
    };

    const statusConfig = getStatusConfig(normalizedOrder.status);
    const isOngoing = normalizedOrder.isOngoing;
    const daysUntilStart = normalizedOrder.daysUntilStart;

    const earliestStart = normalizedOrder.items?.length > 0 ? 
        new Date(Math.min(...normalizedOrder.items.map(item => new Date(item.rentalPeriod?.startDate)).filter(d => !isNaN(d)))) 
        : null;
    const latestEnd = normalizedOrder.items?.length > 0 ? 
        new Date(Math.max(...normalizedOrder.items.map(item => new Date(item.rentalPeriod?.endDate)).filter(d => !isNaN(d)))) 
        : null;

    const isUrgent = normalizedOrder.isUrgent;

    const handleQuickCall = (e) => {
        e.stopPropagation();
        if (normalizedOrder.user?.phone) {
            window.location.href = `tel:${normalizedOrder.user.phone}`;
        } else {
            alert("מספר טלפון לא זמין עבור לקוח זה.");
        }
    };

    const handleQuickEmail = (e) => {
        e.stopPropagation();
        if (normalizedOrder.user?.email) {
            window.location.href = `mailto:${normalizedOrder.user.email}`;
        } else {
            alert("כתובת אימייל לא זמינה עבור לקוח זה.");
        }
    };

    return (
        <div className={`order-card-modern ${normalizedOrder.status?.toLowerCase()} ${isUrgent ? 'urgent' : ''} ${isOngoing ? 'ongoing' : ''}`}
             style={{ boxShadow: `0 8px 32px ${statusConfig.shadowColor}` }}>
            
            {/* Priority Badges */}
            {(isUrgent || isOngoing) && (
                <div className="priority-alerts">
                    {isUrgent && (
                        <div className="alert-badge urgent">
                            <span className="alert-icon">🚨</span>
                            <span className="alert-text">דחוף - {daysUntilStart === 0 ? 'מתחיל היום' : `מתחיל בעוד ${daysUntilStart} ימים`}</span>
                        </div>
                    )}
                    {isOngoing && (
                        <div className="alert-badge ongoing">
                            <span className="alert-icon">🔄</span>
                            <span className="alert-text">השכרה פעילה כעת</span>
                        </div>
                    )}
                </div>
            )}

            {/* Main Card Header */}
            <div className="card-header-modern" onClick={onToggleExpand}>
                <div className="header-left">
                    {/* Customer Avatar & Info */}
                    <div className="customer-section-modern">
                        <div className="customer-avatar-modern" style={{ backgroundColor: statusConfig.color }}>
                            {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="customer-info-modern">
                            <h4 className="customer-name-modern">{customerName}</h4>
                            <div className="order-meta-modern">
                                <span className="meta-item">
                                    <ClockIcon />
                                    {getRelativeTime(normalizedOrder.createdAt)}
                                </span>
                                <span className="meta-divider">•</span>
                                <span className="meta-item">
                                    <span className="items-count">{normalizedOrder.items?.length || 0} פריטים</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-right">
                    {/* Status Badge */}
                    <div className="status-badge-modern" 
                         style={{ 
                             background: statusConfig.bg,
                             color: statusConfig.color,
                             border: `2px solid ${statusConfig.border}`
                         }}>
                        <span className="status-icon">{statusConfig.icon}</span>
                        <span className="status-text">{statusConfig.label}</span>
                    </div>

                    {/* Expand Button */}
                    <button className="expand-btn-modern">
                        {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                    </button>
                </div>
            </div>

            {/* Rental Period Info */}
            {earliestStart && latestEnd && (
                <div className="rental-period-modern">
                    <CalendarIcon />
                    <span className="period-text">
                        {formatDate(earliestStart)} - {formatDate(latestEnd)}
                    </span>
                </div>
            )}

            {/* Quick Actions Row */}
            <div className="quick-actions-modern">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onShowOrderId(normalizedOrder._id);
                    }}
                    className="action-btn-modern id-btn"
                    title="הצג מזהה הזמנה"
                >
                    <IdIcon />
                    <span>מזהה</span>
                </button>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onShowMembership(normalizedOrder.user);
                    }}
                    className="action-btn-modern membership-btn"
                    title="ניהול חברות"
                    style={{ backgroundColor: membershipStatus.color }}
                >
                    <span>{membershipStatus.icon}</span>
                    <span>חברות</span>
                </button>

                <button 
                    onClick={handleQuickCall}
                    className="action-btn-modern call-btn"
                    disabled={!normalizedOrder.user?.phone}
                    title={normalizedOrder.user?.phone ? `התקשר ל-${normalizedOrder.user.phone}` : "מספר טלפון לא זמין"}
                >
                    <PhoneIcon />
                    <span>התקשר</span>
                </button>

                <button 
                    onClick={handleQuickEmail}
                    className="action-btn-modern email-btn"
                    disabled={!normalizedOrder.user?.email}
                    title={normalizedOrder.user?.email ? `שלח מייל ל-${normalizedOrder.user.email}` : "אימייל לא זמין"}
                >
                    <EmailIcon />
                    <span>מייל</span>
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="expanded-content-modern">
                    <div className="content-sections">
                        {/* Customer Details Section - Enhanced */}
                        <div className="section-modern customer-details">
                            <h5 className="section-title-modern">
                                <ContactIcon />
                                פרטי לקוח מפורטים
                            </h5>
                            
                            {/* Basic Contact Info */}
                            <div className="contact-grid-modern">
                                <div className="contact-item-modern">
                                    <EmailIcon />
                                    <span>{normalizedOrder.user?.email || 'לא זמין'}</span>
                                </div>
                                <div className="contact-item-modern">
                                    <PhoneIcon />
                                    <span>{normalizedOrder.user?.phone || 'לא זמין'}</span>
                                </div>
                            </div>

                            {/* Enhanced Customer Information */}
                            {normalizedOrder.customerInfo && (
                                <div className="customer-info-detailed">
                                    <h6 className="section-subtitle">
                                        📋 פרטים אישיים מההזמנה
                                    </h6>
                                    <div className="customer-details-grid">
                                        <div className="detail-item-admin">
                                            <span className="label">שם מלא:</span>
                                            <span className="value">{normalizedOrder.customerInfo.firstName} {normalizedOrder.customerInfo.lastName}</span>
                                        </div>
                                        <div className="detail-item-admin">
                                            <span className="label">אימייל:</span>
                                            <span className="value">{normalizedOrder.customerInfo.email}</span>
                                        </div>
                                        <div className="detail-item-admin">
                                            <span className="label">טלפון:</span>
                                            <span className="value">{normalizedOrder.customerInfo.phone}</span>
                                        </div>
                                        <div className="detail-item-admin id-number">
                                            <span className="label">תעודת זהות:</span>
                                            <span className="value">
                                                {normalizedOrder.customerInfo.idNumber === "PENDING-IN-PERSON" || 
                                                 normalizedOrder.customerInfo.idNumber === "WILL_VERIFY_IN_PERSON" ? 
                                                  <span className="pending-verification">יאומת בעת איסוף 🏢</span> : 
                                                  <span className="id-number-value">{normalizedOrder.customerInfo.idNumber || "לא זמין"}</span>
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contract Status */}
                            {normalizedOrder.contract && (
                                <div className="contract-status-admin">
                                    <h6 className="section-subtitle">
                                        ✍️ סטטוס הסכם השכירות
                                    </h6>
                                    <div className="contract-status-card">
                                        {normalizedOrder.contract.signed ? (
                                            <div className="status-item-admin verified">
                                                <span className="status-icon">✅</span>
                                                <div className="status-details">
                                                    <span className="status-text">הסכם נחתם דיגיטלית</span>
                                                    <span className="status-date">נחתם ב: {formatDate(normalizedOrder.contract.signedAt)}</span>
                                                    <span className="contract-version">גרסת הסכם: {normalizedOrder.contract.agreementVersion}</span>
                                                    {normalizedOrder.contract.signatureData && (
                                                        <button 
                                                            className="view-signature-btn"
                                                            onClick={() => {
                                                                const newWindow = window.open();
                                                                newWindow.document.write(`<img src="${normalizedOrder.contract.signatureData}" alt="חתימה דיגיטלית" style="max-width:100%;"/>`);
                                                            }}
                                                        >
                                                            🖊️ צפה בחתימה
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : normalizedOrder.metadata?.onboardingChoice === "in-person" ? (
                                            <div className="status-item-admin pending">
                                                <span className="status-icon">🏢</span>
                                                <div className="status-details">
                                                    <span className="status-text">הסכם יחתם בעת איסוף הציוד</span>
                                                    <span className="status-note">הלקוח בחר בתהליך אישי</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="status-item-admin missing">
                                                <span className="status-icon">❌</span>
                                                <div className="status-details">
                                                    <span className="status-text">הסכם לא נחתם</span>
                                                    <span className="status-note">דורש טיפול</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ID Upload Status */}
                            {normalizedOrder.idUpload && (
                                <div className="id-upload-status-admin">
                                    <h6 className="section-subtitle">
                                        📄 סטטוס תעודת זהות
                                    </h6>
                                    <div className="id-upload-status-card">
                                        {normalizedOrder.idUpload.uploaded ? (
                                            <div className="status-item-admin verified">
                                                <span className="status-icon">✅</span>
                                                <div className="status-details">
                                                    <span className="status-text">תעודת זהות הועלתה</span>
                                                    <span className="file-info">קובץ: {normalizedOrder.idUpload.fileName}</span>
                                                    {normalizedOrder.idUpload.fileUrl && (
                                                        <button 
                                                            className="view-id-btn"
                                                            onClick={() => {
                                                                // In real implementation, this would open the actual file
                                                                alert(`פתיחת קובץ: ${normalizedOrder.idUpload.fileName}`);
                                                            }}
                                                        >
                                                            👁️ צפה בתעודת זהות
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : normalizedOrder.metadata?.onboardingChoice === "in-person" ? (
                                            <div className="status-item-admin pending">
                                                <span className="status-icon">🏢</span>
                                                <div className="status-details">
                                                    <span className="status-text">תעודת זהות תאומת בעת איסוף הציוד</span>
                                                    <span className="status-note">הלקוח בחר בתהליך אישי</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="status-item-admin missing">
                                                <span className="status-icon">❌</span>
                                                <div className="status-details">
                                                    <span className="status-text">תעודת זהות לא הועלתה</span>
                                                    <span className="status-note">דורש טיפול</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Pickup/Return Information */}
                            {normalizedOrder.pickupReturn && (
                                <div className="pickup-return-admin">
                                    <h6 className="section-subtitle">
                                        📍 פרטי איסוף והחזרה
                                    </h6>
                                    <div className="pickup-return-grid-admin">
                                        <div className="pickup-details-admin">
                                            <h7>🚚 איסוף</h7>
                                            <div className="pickup-info">
                                                <p><strong>תאריך:</strong> {formatDate(normalizedOrder.pickupReturn.pickupDate)}</p>
                                                <p><strong>שעה:</strong> {normalizedOrder.pickupReturn.pickupTime}</p>
                                                <p><strong>כתובת:</strong> {normalizedOrder.pickupReturn.pickupAddress}</p>
                                            </div>
                                        </div>
                                        <div className="return-details-admin">
                                            <h7>🔄 החזרה</h7>
                                            <div className="return-info">
                                                <p><strong>תאריך:</strong> {formatDate(normalizedOrder.pickupReturn.returnDate)}</p>
                                                <p><strong>שעה:</strong> {normalizedOrder.pickupReturn.returnTime}</p>
                                                <p><strong>כתובת:</strong> {normalizedOrder.pickupReturn.returnAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {normalizedOrder.pickupReturn.specialInstructions && (
                                        <div className="special-instructions">
                                            <strong>הוראות מיוחדות:</strong>
                                            <p>{normalizedOrder.pickupReturn.specialInstructions}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Membership Status */}
                            <div className="membership-status-section">
                                <h6 className="membership-title">
                                    🏛️ סטטוס חברות
                                </h6>
                                <div className="membership-badge-card" style={{ borderColor: membershipStatus.color }}>
                                    <span className="membership-icon">{membershipStatus.icon}</span>
                                    <span className="membership-label">{membershipStatus.label}</span>
                                    {membershipStatus.status === 'pending' && (
                                        <span className="membership-action-hint">• דורש אימות מסמכים</span>
                                    )}
                                    {membershipStatus.status === 'not-member' && (
                                        <span className="membership-action-hint">• ניתן לעבד חברות במקום</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="section-modern products-section">
                            <h5 className="section-title-modern">
                                📦 מוצרים בהזמנה ({normalizedOrder.items?.length || 0})
                            </h5>
                            <div className="products-list-modern">
                                {normalizedOrder.items && normalizedOrder.items.length > 0 ? normalizedOrder.items.map((item, index) => (
                                    <div key={index} className="product-card-modern">
                                        <div className="product-image-modern">
                                            {item.product?.productImageUrl ? (
                                                <img 
                                                    src={item.product.productImageUrl} 
                                                    alt={item.product.name || 'מוצר'}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="product-placeholder-modern" style={{ display: item.product?.productImageUrl ? 'none' : 'flex' }}>
                                                📦
                                            </div>
                                        </div>
                                        <div className="product-details-modern">
                                            <h6 className="product-name-modern">
                                                {item.product?.name || 'שם מוצר לא זמין'}
                                            </h6>
                                            <div className="product-meta-modern">
                                                <div className="rental-dates-modern">
                                                    <CalendarIcon />
                                                    <span>
                                                        {formatDate(item.rentalPeriod?.startDate)} - {formatDate(item.rentalPeriod?.endDate)}
                                                    </span>
                                                </div>
                                                {item.product?.price && (
                                                    <div className="product-price-modern">
                                                        <span className="price-amount">₪{item.product.price}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="no-products-modern">
                                        <p>לא נמצאו מוצרים בהזמנה זו</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons for Pending Orders */}
                    {normalizedOrder.status === 'Pending' && (
                        <div className="decision-actions-modern">
                            <button 
                                onClick={() => onAccept(normalizedOrder._id)}
                                className="decision-btn-modern accept-btn"
                            >
                                <span className="btn-icon">✅</span>
                                <span className="btn-text">אשר הזמנה</span>
                            </button>
                            <button 
                                onClick={() => onReject(normalizedOrder._id)}
                                className="decision-btn-modern reject-btn"
                            >
                                <span className="btn-icon">❌</span>
                                <span className="btn-text">דחה הזמנה</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Order ID Modal Component
const OrderIdModal = ({ orderId, onClose }) => {
    if (!orderId) return null;
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(orderId);
            alert('מזהה הזמנה הועתק בהצלחה! 📋');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('שגיאה בהעתקה');
        }
    };

    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium order-id-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🆔 מזהה הזמנה</h3>
                    <p>השתמש במזהה זה לעקיבה ותיאום</p>
                </div>
                <div className="order-id-display">
                    <div className="id-container premium">
                        <code className="order-id-code">{orderId}</code>
                        <button onClick={copyToClipboard} className="copy-btn premium">
                            📋 העתק
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="modal-close-btn premium">סגור</button>
            </div>
        </div>
    );
};

// Customer Contact Modal Component
const CustomerContactModal = ({ customer, onClose }) => {
    if (!customer) return null;
    
    const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'לקוח';
    
    const handleSendSMS = () => {
        if (customer.phone) {
            window.location.href = `sms:${customer.phone}`;
        } else {
            alert("מספר טלפון לא זמין עבור לקוח זה.");
        }
    };
    
    const handleSendEmail = () => {
        if (customer.email) {
            window.location.href = `mailto:${customer.email}`;
        } else {
            alert("כתובת אימייל לא זמינה עבור לקוח זה.");
        }
    };

    const handleCall = () => {
        if (customer.phone) {
            window.location.href = `tel:${customer.phone}`;
        } else {
            alert("מספר טלפון לא זמין עבור לקוח זה.");
        }
    };

    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium customer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>👤 פרטי יצירת קשר</h3>
                    <p>דרכי התקשרות עם הלקוח</p>
                </div>
                <div className="customer-profile premium">
                    <div className="customer-avatar-large">
                        {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="customer-info">
                        <h4>{customerName}</h4>
                        <div className="contact-details-grid">
                            <div className="contact-item premium">
                                <EmailIcon />
                                <span>{customer.email || 'לא זמין'}</span>
                            </div>
                            <div className="contact-item premium">
                                <PhoneIcon />
                                <span>{customer.phone || 'לא זמין'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="contact-actions-grid premium">
                    <button 
                        onClick={handleCall}
                        className="contact-action-btn premium call-btn" 
                        disabled={!customer.phone}
                    >
                        <PhoneIcon />
                        <span>התקשר</span>
                    </button>
                    <button 
                        onClick={handleSendSMS}
                        className="contact-action-btn premium sms-btn" 
                        disabled={!customer.phone}
                    >
                        💬
                        <span>שלח SMS</span>
                    </button>
                    <button 
                        onClick={handleSendEmail}
                        className="contact-action-btn premium email-btn" 
                        disabled={!customer.email}
                    >
                        <EmailIcon />
                        <span>שלח Email</span>
                    </button>
                </div>
                <button onClick={onClose} className="modal-close-btn premium">סגור</button>
            </div>
        </div>
    );
};

// Confirmation Modal Component
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay premium" onClick={onCancel}>
            <div className="modal-content premium confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>⚠️ אישור פעולה</h3>
                    <p>אנא אשר את הפעולה שברצונך לבצע</p>
                </div>
                <div className="confirmation-content">
                    <p className="confirmation-message">{message}</p>
                </div>
                <div className="confirmation-actions">
                    <button onClick={onConfirm} className="action-btn premium confirm">✅ כן, בצע</button>
                    <button onClick={onCancel} className="action-btn premium cancel">❌ ביטול</button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const ManageRentalsPage = () => {
    // State
    const [orders, setOrders] = useState([]);
    const [paginationData, setPaginationData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [quickFilter, setQuickFilter] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);
    
    // Modals
    const [showCustomerContactModal, setShowCustomerContactModal] = useState(false);
    const [currentCustomerForModal, setCurrentCustomerForModal] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [showOrderIdModal, setShowOrderIdModal] = useState(false);
    const [currentOrderIdForModal, setCurrentOrderIdForModal] = useState(null);
    const [showMembershipModal, setShowMembershipModal] = useState(false);
    const [currentCustomerForMembership, setCurrentCustomerForMembership] = useState(null);

    // Ref for the results section
    const resultsRef = useRef(null);

    const { user } = useAuth();
    const token = user?.token || user?.accessToken;

    // Debounced fetch function to avoid too many API calls
    const debouncedFetch = useCallback(
        debounce((params) => {
            fetchOrders(params);
        }, 300),
        [token]
    );

    // Simple debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Fetch orders with pagination and filters
    const fetchOrders = useCallback(async (params = {}) => {
        if (!token) {
            setError("נדרשת התחברות לצפייה בדף זה.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const queryParams = {
                page: params.page || currentPage,
                limit: pageSize,
                search: params.search !== undefined ? params.search : searchText,
                status: params.status !== undefined ? params.status : (activeTab !== 'all' ? activeTab : ''),
                quickFilter: params.quickFilter !== undefined ? params.quickFilter : quickFilter,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };

            // Remove empty parameters
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                    delete queryParams[key];
                }
            });

            console.log('Fetching orders with params:', queryParams);
            const response = await getOrdersAsAdmin(token, queryParams);
            console.log('Fetched paginated orders:', response);

            setOrders(response.orders || []);
            setPaginationData(response.pagination || null);
            setStatistics(response.statistics || null);

            // Update current page if it was provided in params
            if (params.page) {
                setCurrentPage(params.page);
            }

        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError(err.message || "שגיאה בטעינת ההזמנות.");
            setOrders([]);
            setPaginationData(null);
            setStatistics(null);
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, pageSize, searchText, activeTab, quickFilter]);

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, []);

    // Handle search text change with debouncing
    useEffect(() => {
        if (searchText !== undefined) {
            debouncedFetch({ page: 1, search: searchText });
            setCurrentPage(1);
        }
    }, [searchText, debouncedFetch]);

    // Handle tab change
    useEffect(() => {
        fetchOrders({ page: 1, status: activeTab !== 'all' ? activeTab : '' });
        setCurrentPage(1);
    }, [activeTab]);

    // Handle quick filter change
    useEffect(() => {
        fetchOrders({ page: 1, quickFilter });
        setCurrentPage(1);
    }, [quickFilter]);

    // Helper function to scroll to results section smoothly
    const scrollToResults = () => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Event handlers
    const handleSearchTextChange = (newSearchText) => {
        setSearchText(newSearchText);
    };

    const handleSearchEnter = () => {
        scrollToResults(); // Scroll to results when Enter is pressed in search
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        // No scroll needed - tabs are at top of screen
    };

    const handleQuickFilter = (filterType) => {
        const newFilter = quickFilter === filterType ? '' : filterType;
        setQuickFilter(newFilter);
        // No scroll needed - filters are at top of screen
    };

    const handlePageChange = (newPage) => {
        fetchOrders({ page: newPage });
        scrollToResults(); // Scroll to results when changing numbered pages
    };

    const handleClearAllFilters = () => {
        setSearchText('');
        setQuickFilter('');
        setActiveTab('all');
        setCurrentPage(1);
        fetchOrders({ page: 1, search: '', status: '', quickFilter: '' });
        // No scroll needed - user initiated action from filters at top
    };

    const handleToggleExpand = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const handleShowCustomerContact = (customer) => {
        setCurrentCustomerForModal(customer);
        setShowCustomerContactModal(true);
    };

    const handleShowOrderId = (orderId) => {
        setCurrentOrderIdForModal(orderId);
        setShowOrderIdModal(true);
    };

    const handleShowMembership = (customer) => {
        setCurrentCustomerForMembership(customer);
        setShowMembershipModal(true);
    };

    const handleMembershipUpdate = () => {
        // Refresh orders to get updated membership data
        fetchOrders();
    };

    const handleAccept = (orderId) => {
        setConfirmationAction({
            orderId,
            newStatus: 'Accepted',
            message: 'האם אתה בטוח שברצונך לאשר הזמנה זו? הפעולה תשלח הודעה ללקוח.'
        });
        setShowConfirmationModal(true);
    };

    const handleReject = (orderId) => {
        setConfirmationAction({
            orderId,
            newStatus: 'Rejected',
            message: 'האם אתה בטוח שברצונך לדחות הזמנה זו? הפעולה תשלח הודעה ללקוח.'
        });
        setShowConfirmationModal(true);
    };

    const handleConfirmAction = async () => {
        if (!confirmationAction || !token) return;
        
        try {
            const updatedOrder = await updateOrderStatusAsAdmin(
                confirmationAction.orderId, 
                confirmationAction.newStatus, 
                token
            );

            // Update the order in the current page
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o)
            );

            setShowConfirmationModal(false);
            setConfirmationAction(null);

            // Refetch to ensure consistency and update statistics
            setTimeout(() => {
                fetchOrders();
            }, 500);

        } catch (err) {
            setError(`שגיאה בעדכון סטטוס הזמנה: ${err.message}`);
        }
    };

    const handleCancelAction = () => {
        setShowConfirmationModal(false);
        setConfirmationAction(null);
    };

    const hasActiveFilters = searchText || quickFilter || activeTab !== 'all';

    // Calculate stats for tabs using API statistics
    const tabCounts = statistics?.tabCounts || {
        all: 0,
        pending: 0,
        ongoing: 0,
        accepted: 0,
        rejected: 0
    };

    if (loading && !orders.length) return (
        <div className="loading-screen premium">
            <div className="loading-content">
                <div className="loading-spinner">⏳</div>
                <h3>טוען הזמנות...</h3>
                <p>אנא המתן בזמן שאנו טוענים את המידע</p>
            </div>
        </div>
    );
    
    if (error && !loading && !orders.length) return (
        <div className="error-screen premium">
            <div className="error-content">
                <div className="error-icon">❌</div>
                <h3>שגיאה בטעינת המידע</h3>
                <p>{error}</p>
                <button onClick={() => fetchOrders()} className="retry-btn premium">נסה שוב</button>
            </div>
        </div>
    );

    return (
        <div className="manage-rentals-page premium">
            <header className="page-header premium">
                <div className="header-content">
                    <div className="title-section">
                        <h1>🏢 מערכת ניהול השכרות</h1>
                        <p>ניהול חכם ומתקדם של הזמנות והשכרות</p>
                    </div>
                </div>
                <OrderStatistics statistics={statistics} />
            </header>

            <div className="controls-section premium">
                <SearchBar 
                    searchText={searchText}
                    onSearchTextChange={handleSearchTextChange}
                    onQuickFilter={handleQuickFilter}
                    activeQuickFilter={quickFilter}
                    hasActiveFilters={hasActiveFilters}
                    onClearAllFilters={handleClearAllFilters}
                    onSearchEnter={handleSearchEnter}
                />
                
                <div className="status-tabs premium">
                    <div className="tabs-header">
                        <h4>📊 סטטוס הזמנות</h4>
                        <p>סינון מתקדם לפי סטטוס הזמנה</p>
                    </div>
                    <div className="tabs-container">
                        <button 
                            onClick={() => handleTabChange('all')}
                            className={`tab-btn premium ${activeTab === 'all' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">🎯</span>
                            <span className="tab-text">הכל</span>
                            <span className="tab-count">({tabCounts.all})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('Pending')}
                            className={`tab-btn premium ${activeTab === 'Pending' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">⏳</span>
                            <span className="tab-text">ממתינות</span>
                            <span className="tab-count">({tabCounts.pending})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('ongoing')}
                            className={`tab-btn premium ${activeTab === 'ongoing' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">🔄</span>
                            <span className="tab-text">פעילות</span>
                            <span className="tab-count">({tabCounts.ongoing})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('Accepted')}
                            className={`tab-btn premium ${activeTab === 'Accepted' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">✅</span>
                            <span className="tab-text">מאושרות</span>
                            <span className="tab-count">({tabCounts.accepted})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('Rejected')}
                            className={`tab-btn premium ${activeTab === 'Rejected' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">❌</span>
                            <span className="tab-text">נדחו</span>
                            <span className="tab-count">({tabCounts.rejected})</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="orders-section premium" ref={resultsRef}>
                {!loading && orders.length === 0 ? (
                    <div className="no-orders premium">
                        <div className="no-orders-content">
                            <div className="no-orders-icon">🔍</div>
                            <h3>לא נמצאו הזמנות</h3>
                            <p>נסה לשנות את מסנני החיפוש או לנקות את כל הפילטרים</p>
                            {hasActiveFilters && (
                                <button onClick={handleClearAllFilters} className="clear-filters-btn premium">
                                    🧹 נקה פילטרים
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="orders-container premium">
                        <div className="orders-header">
                            <h3>📋 הזמנות</h3>
                            {paginationData && (
                                <p>הצגת {orders.length} הזמנות מתוך {paginationData.totalOrders} סה"כ</p>
                            )}
                            {loading && (
                                <div className="loading-indicator">
                                    <span>⏳ טוען...</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="orders-grid premium">
                            {orders.map(order => (
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    isExpanded={expandedOrders.has(order._id)}
                                    onToggleExpand={() => handleToggleExpand(order._id)}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                    onShowCustomerContact={handleShowCustomerContact}
                                    onShowOrderId={handleShowOrderId}
                                    onShowMembership={handleShowMembership}
                                />
                            ))}
                        </div>

                        <PaginationControls 
                            paginationData={paginationData}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            {showOrderIdModal && currentOrderIdForModal && (
                <OrderIdModal 
                    orderId={currentOrderIdForModal} 
                    onClose={() => {
                        setShowOrderIdModal(false);
                        setCurrentOrderIdForModal(null);
                    }}
                />
            )}

            {showCustomerContactModal && currentCustomerForModal && (
                <CustomerContactModal
                    customer={currentCustomerForModal}
                    onClose={() => {
                        setShowCustomerContactModal(false);
                        setCurrentCustomerForModal(null);
                    }}
                />
            )}

            {showMembershipModal && currentCustomerForMembership && (
                <MembershipModal
                    customer={currentCustomerForMembership}
                    onClose={() => {
                        setShowMembershipModal(false);
                        setCurrentCustomerForMembership(null);
                    }}
                    onMembershipUpdate={handleMembershipUpdate}
                />
            )}

            {showConfirmationModal && confirmationAction && (
                <ConfirmationModal
                    message={confirmationAction.message}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelAction}
                />
            )}
        </div>
    );
};

export default ManageRentalsPage;
