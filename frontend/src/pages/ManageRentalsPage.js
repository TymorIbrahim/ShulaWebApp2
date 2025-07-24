// src/pages/ManageRentalsPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrdersAsAdmin, updateOrderStatusAsAdmin } from '../services/orderService';
import MembershipModal from '../components/admin/MembershipModal';
import PickupConfirmationModal from '../components/admin/PickupConfirmationModal';
import ReturnConfirmationModal from '../components/admin/ReturnConfirmationModal';
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
// NEW: Pickup Icon
const PickupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
  </svg>
);
// NEW: Return Icon
const ReturnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12M18,11H10L13.5,7.5L12.08,6.08L6.16,12L12.08,17.92L13.5,16.5L10,13H18V11Z"/>
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
    return order.status === 'PickedUp';
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
        total: 0, totalItems: 0, revenue: 0, avgItemsPerOrder: 0,
        pickedUp: 0, completed: 0
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
                    <div className="stat-content">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">סה"כ הזמנות</div>
                        <div className="stat-trend">במערכת</div>
                    </div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-content">
                        <div className="stat-number">{stats.pending}</div>
                        <div className="stat-label">ממתינות לטיפול</div>
                        <div className="stat-trend">דורש פעולה</div>
                    </div>
                </div>
                <div className="stat-card accepted">
                    <div className="stat-content">
                        <div className="stat-number">{stats.accepted}</div>
                        <div className="stat-label">מאושרות לאיסוף</div>
                        <div className="stat-trend">מוכנות</div>
                    </div>
                </div>
                <div className="stat-card ongoing">
                    <div className="stat-content">
                        <div className="stat-number">{stats.ongoing}</div>
                        <div className="stat-label">השכרות פעילות</div>
                        <div className="stat-trend">כרגע מושכרות</div>
                    </div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-content">
                        <div className="stat-number">{stats.completed}</div>
                        <div className="stat-label">הושלמו</div>
                        <div className="stat-trend">בארכיון</div>
                    </div>
                </div>
                <div className="stat-card revenue">
                    <div className="stat-content">
                        <div className="stat-number">₪{stats.revenue.toLocaleString()}</div>
                        <div className="stat-label">הכנסות מאושרות</div>
                        <div className="stat-trend">מכל ההזמנות</div>
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
                        <span className="filter-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19M5,6V5H19V6H5Z"/>
                            </svg>
                        </span>
                        <span className="filter-text">היום</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('pending')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'pending' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                            </svg>
                        </span>
                        <span className="filter-text">ממתינות</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('ready_for_pickup')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'ready_for_pickup' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <PickupIcon />
                        </span>
                        <span className="filter-text">מוכנות לאיסוף</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('ongoing')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'ongoing' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12H4A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
                            </svg>
                        </span>
                        <span className="filter-text">פעילות</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('due_for_return')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'due_for_return' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <ReturnIcon />
                        </span>
                        <span className="filter-text">דורש החזרה</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('urgent')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'urgent' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                            </svg>
                        </span>
                        <span className="filter-text">דחוף</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('recent')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'recent' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                            </svg>
                        </span>
                        <span className="filter-text">השבוע</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('completed_today')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'completed_today' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                            </svg>
                        </span>
                        <span className="filter-text">הושלמו היום</span>
                    </button>
                    <button 
                        onClick={() => onQuickFilter('late_returns')} 
                        className={`quick-filter-btn premium ${activeQuickFilter === 'late_returns' ? 'active' : ''}`}
                    >
                        <span className="filter-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                            </svg>
                        </span>
                        <span className="filter-text">החזרות מאוחרות</span>
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
    onShowMembership,
    onConfirmPickup,
    onConfirmReturn
}) => {
    const normalizedOrder = normalizeOrder(order);
    console.log('Normalized order:', normalizedOrder);
    
    // Safely get customer name with defensive programming
    const getCustomerName = () => {
        if (!normalizedOrder.user) return 'לקוח לא ידוע';
        
        const firstName = typeof normalizedOrder.user.firstName === 'string' ? normalizedOrder.user.firstName : '';
        const lastName = typeof normalizedOrder.user.lastName === 'string' ? normalizedOrder.user.lastName : '';
        const email = typeof normalizedOrder.user.email === 'string' ? normalizedOrder.user.email : '';
        
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || email || 'לקוח לא ידוע';
    };
    
    const customerName = getCustomerName();
    
    // Get membership status
    const getMembershipStatus = () => {
        const membership = normalizedOrder.user?.membership;
        if (!membership?.isMember) {
            return { 
                status: 'not-member', 
                label: 'לא חבר', 
                icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                ), 
                color: '#f39c12' 
            };
        }
        
        if (membership.membershipType === 'online') {
            if (membership.idVerification?.verified) {
                return { 
                    status: 'verified', 
                    label: 'חבר מאומת', 
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                        </svg>
                    ), 
                    color: '#27ae60' 
                };
            } else {
                return { 
                    status: 'pending', 
                    label: 'ממתין לאימות', 
                    icon: (
                        <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                        </svg>
                    ), 
                    color: '#f39c12' 
                };
            }
        } else if (membership.membershipType === 'in_person') {
            return { 
                status: 'in-person', 
                label: 'חבר במקום', 
                icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H14V15H12V13H14V11H12V9H20V19M18,11H16V13H18V11M18,15H16V17H18V15Z"/>
                    </svg>
                ), 
                color: '#8e44ad' 
            };
        }
        
        return { 
            status: 'unknown', 
            label: 'סטטוס לא ידוע', 
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.5,14.17C13,14.67 13,15.33 13,16H10C10,14.33 10,13.92 10.5,13.42C11.25,12.67 12.58,12 13.42,11.17C15.08,9.5 15.08,6.83 13.42,5.17C11.75,3.5 9.08,3.5 7.42,5.17C6.08,6.5 6,8.25 6,10H3C3,7.75 3.25,5.5 5.17,3.58C7.08,1.67 9.75,1.78 12,2Z"/>
                </svg>
            ), 
            color: '#95a5a6' 
        };
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
                    icon: (
                        <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                        </svg>
                    ),
                    shadowColor: 'rgba(251, 146, 60, 0.3)'
                };
            case 'accepted': 
                return { 
                    bg: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)', 
                    color: '#16a34a', 
                    border: '#22c55e',
                    label: 'מאושר לאיסוף',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                        </svg>
                    ),
                    shadowColor: 'rgba(34, 197, 94, 0.3)'
                };
            case 'pickedup':
                return { 
                    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                    color: '#2563eb', 
                    border: '#3b82f6',
                    label: 'הושכר - פעיל',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12H4A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
                        </svg>
                    ),
                    shadowColor: 'rgba(59, 130, 246, 0.3)'
                };
            case 'completed':
                return { 
                    bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                    color: '#0891b2', 
                    border: '#0ea5e9',
                    label: 'הושלם',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                        </svg>
                    ),
                    shadowColor: 'rgba(14, 165, 233, 0.3)'
                };
            case 'rejected': 
                return { 
                    bg: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', 
                    color: '#dc2626', 
                    border: '#f87171',
                    label: 'נדחה',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                        </svg>
                    ),
                    shadowColor: 'rgba(248, 113, 113, 0.3)'
                };
            case 'cancelled':
                return { 
                    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                    color: '#64748b', 
                    border: '#cbd5e1',
                    label: 'בוטל',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
                        </svg>
                    ),
                    shadowColor: 'rgba(203, 213, 225, 0.3)'
                };
            default: 
                return { 
                    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                    color: '#64748b', 
                    border: '#cbd5e1',
                    label: 'לא ידוע',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.5,14.17C13,14.67 13,15.33 13,16H10C10,14.33 10,13.92 10.5,13.42C11.25,12.67 12.58,12 13.42,11.17C15.08,9.5 15.08,6.83 13.42,5.17C11.75,3.5 9.08,3.5 7.42,5.17C6.08,6.5 6,8.25 6,10H3C3,7.75 3.25,5.5 5.17,3.58C7.08,1.67 9.75,1.78 12,2Z"/>
                        </svg>
                    ),
                    shadowColor: 'rgba(203, 213, 225, 0.3)'
                };
        }
    };

    const statusConfig = getStatusConfig(normalizedOrder.status);
    const isOngoing = isOrderOngoing(normalizedOrder);
    const daysUntilStart = getDaysUntilStart(normalizedOrder);

    const earliestStart = normalizedOrder.items?.length > 0 ? 
        new Date(Math.min(...normalizedOrder.items.map(item => new Date(item.rentalPeriod?.startDate)).filter(d => !isNaN(d)))) 
        : null;
    const latestEnd = normalizedOrder.items?.length > 0 ? 
        new Date(Math.max(...normalizedOrder.items.map(item => new Date(item.rentalPeriod?.endDate)).filter(d => !isNaN(d)))) 
        : null;

    const isUrgent = daysUntilStart !== null && daysUntilStart <= 1 && daysUntilStart >= 0;

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

    // NEW: Calculate if order is due for return
    const isDueForReturn = () => {
        if (normalizedOrder.status !== 'PickedUp' || !latestEnd) return false;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return latestEnd <= today;
    };

    const dueForReturn = isDueForReturn();

    return (
        <div className={`order-card-modern ${normalizedOrder.status?.toLowerCase()} ${isUrgent ? 'urgent' : ''} ${isOngoing ? 'ongoing' : ''} ${dueForReturn ? 'due-return' : ''}`}
             style={{ boxShadow: `0 8px 32px ${statusConfig.shadowColor}` }}>
            
            {/* Priority Badges */}
            {(isUrgent || isOngoing || dueForReturn) && (
                <div className="priority-alerts">
                    {isUrgent && normalizedOrder.status === 'Accepted' && (
                        <div className="alert-badge urgent">
                            <span className="alert-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                                </svg>
                            </span>
                            <span className="alert-text">דחוף - {daysUntilStart === 0 ? 'מתחיל היום' : `מתחיל בעוד ${daysUntilStart} ימים`}</span>
                        </div>
                    )}
                    {isOngoing && (
                        <div className="alert-badge ongoing">
                            <span className="alert-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12H4A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
                                </svg>
                            </span>
                            <span className="alert-text">השכרה פעילה כעת</span>
                        </div>
                    )}
                    {dueForReturn && (
                        <div className="alert-badge due-return">
                            <span className="alert-icon">
                                <ReturnIcon />
                            </span>
                            <span className="alert-text">
                                {latestEnd && new Date() > latestEnd ? 
                                    `פגועת זמן - ${Math.floor((new Date() - latestEnd) / (1000 * 60 * 60 * 24))} ימים` : 
                                    'דורש החזרה היום'
                                }
                            </span>
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
                                    <span className="items-count">{normalizedOrder.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} פריטים</span>
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
                                        <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19M5,6V5H19V6H5Z"/>
                                        </svg>
                                        פרטים אישיים מההזמנה
                                    </h6>
                                    <div className="customer-details-grid">
                                        <div className="detail-item-admin">
                                            <span className="label">שם מלא:</span>
                                            <span className="value">
                                                {(typeof normalizedOrder.customerInfo.firstName === 'string' ? normalizedOrder.customerInfo.firstName : '')} {(typeof normalizedOrder.customerInfo.lastName === 'string' ? normalizedOrder.customerInfo.lastName : '')}
                                            </span>
                                        </div>
                                        <div className="detail-item-admin">
                                            <span className="label">אימייל:</span>
                                            <span className="value">{typeof normalizedOrder.customerInfo.email === 'string' ? normalizedOrder.customerInfo.email : 'לא זמין'}</span>
                                        </div>
                                        <div className="detail-item-admin">
                                            <span className="label">טלפון:</span>
                                            <span className="value">{typeof normalizedOrder.customerInfo.phone === 'string' ? normalizedOrder.customerInfo.phone : 'לא זמין'}</span>
                                        </div>
                                        <div className="detail-item-admin id-number">
                                            <span className="label">תעודת זהות:</span>
                                            <span className="value">
                                                {normalizedOrder.customerInfo.idNumber === "PENDING-IN-PERSON" || 
                                                 normalizedOrder.customerInfo.idNumber === "WILL_VERIFY_IN_PERSON" ? 
                                                  <span className="pending-verification">יאומת בעת איסוף</span> : 
                                                  <span className="id-number-value">{typeof normalizedOrder.customerInfo.idNumber === 'string' ? normalizedOrder.customerInfo.idNumber : "לא זמין"}</span>
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
                                        סטטוס הסכם השכירות
                                    </h6>
                                    <div className="contract-status-card">
                                        {normalizedOrder.contract.signed ? (
                                            <div className="status-item-admin verified">
                                                <span className="status-icon">✓</span>
                                                <div className="status-details">
                                                    <span className="status-text">הסכם נחתם דיגיטלית</span>
                                                    <span className="status-date">נחתם ב: {formatDate(normalizedOrder.contract.signedAt)}</span>
                                                    <span className="contract-version">גרסת הסכם: {normalizedOrder.contract.agreementVersion}</span>
                                                    {(normalizedOrder.contract.signatureData || normalizedOrder.contract.gcsSignatureUrl) && (
                                                        <button 
                                                            className="view-signature-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const signatureUrl = normalizedOrder.contract.gcsSignatureUrl || normalizedOrder.contract.signatureData;
                                                                const newWindow = window.open('', '_blank');
                                                                newWindow.document.write(`
                                                                    <!DOCTYPE html>
                                                                    <html>
                                                                    <head>
                                                                        <title>חתימה דיגיטלית - ${normalizedOrder.customerInfo?.firstName} ${normalizedOrder.customerInfo?.lastName}</title>
                                                                        <style>
                                                                            body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                                                            img { max-width: 90%; max-height: 90vh; box-shadow: 0 4px 20px rgba(0,0,0,0.1); background: white; padding: 20px; }
                                                                            .container { text-align: center; }
                                                                            h2 { font-family: Arial, sans-serif; color: #333; margin-bottom: 20px; }
                                                                        </style>
                                                                    </head>
                                                                    <body>
                                                                        <div class="container">
                                                                            <h2>חתימה דיגיטלית - ${normalizedOrder.customerInfo?.firstName || ''} ${normalizedOrder.customerInfo?.lastName || ''}</h2>
                                                                            <img src="${signatureUrl}" alt="חתימה דיגיטלית" />
                                                                        </div>
                                                                    </body>
                                                                    </html>
                                                                `);
                                                                newWindow.document.close();
                                                            }}
                                                        >
                                                            צפה בחתימה
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : normalizedOrder.metadata?.onboardingChoice === "in-person" ? (
                                            <div className="status-item-admin pending">
                                                <span className="status-icon">●</span>
                                                <div className="status-details">
                                                    <span className="status-text">הסכם יחתם בעת איסוף הציוד</span>
                                                    <span className="status-note">הלקוח בחר בתהליך אישי</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="status-item-admin missing">
                                                <span className="status-icon">✗</span>
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
                                        סטטוס תעודת זהות
                                    </h6>
                                    <div className="id-upload-status-card">
                                        {normalizedOrder.idUpload.uploaded ? (
                                            <div className="status-item-admin verified">
                                                <span className="status-icon">✓</span>
                                                <div className="status-details">
                                                    <span className="status-text">תעודת זהות הועלתה</span>
                                                    <span className="file-info">קובץ: {normalizedOrder.idUpload.fileName}</span>
                                                    {(normalizedOrder.idUpload.fileUrl || normalizedOrder.idUpload.gcsUrl) && (
                                                        <button 
                                                            className="view-id-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const imageUrl = normalizedOrder.idUpload.gcsUrl || normalizedOrder.idUpload.fileUrl;
                                                                if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
                                                                    // Open in new window
                                                                    const newWindow = window.open('', '_blank');
                                                                    newWindow.document.write(`
                                                                        <!DOCTYPE html>
                                                                        <html>
                                                                        <head>
                                                                            <title>תעודת זהות - ${normalizedOrder.customerInfo?.firstName} ${normalizedOrder.customerInfo?.lastName}</title>
                                                                            <style>
                                                                                body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                                                                img { max-width: 90%; max-height: 90vh; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                                                                                .container { text-align: center; }
                                                                                h2 { font-family: Arial, sans-serif; color: #333; margin-bottom: 20px; }
                                                                            </style>
                                                                        </head>
                                                                        <body>
                                                                            <div class="container">
                                                                                <h2>תעודת זהות - ${normalizedOrder.customerInfo?.firstName || ''} ${normalizedOrder.customerInfo?.lastName || ''}</h2>
                                                                                <img src="${imageUrl}" alt="תעודת זהות" />
                                                                            </div>
                                                                        </body>
                                                                        </html>
                                                                    `);
                                                                    newWindow.document.close();
                                                                } else {
                                                                    // Try to download if it's a relative URL
                                                                    window.open(imageUrl, '_blank');
                                                                }
                                                            }}
                                                        >
                                                            צפה בתעודת זהות
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : normalizedOrder.metadata?.onboardingChoice === "in-person" ? (
                                            <div className="status-item-admin pending">
                                                <span className="status-icon">●</span>
                                                <div className="status-details">
                                                    <span className="status-text">תעודת זהות תאומת בעת איסוף הציוד</span>
                                                    <span className="status-note">הלקוח בחר בתהליך אישי</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="status-item-admin missing">
                                                <span className="status-icon">✗</span>
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
                                        פרטי איסוף והחזרה
                                    </h6>
                                    <div className="pickup-return-grid-admin">
                                        <div className="pickup-details-admin">
                                            <h7>איסוף</h7>
                                            <div className="pickup-info">
                                                <p><strong>תאריך:</strong> {formatDate(normalizedOrder.pickupReturn.pickupDate)}</p>
                                                <p><strong>שעה:</strong> {normalizedOrder.pickupReturn.pickupTime}</p>
                                                <p><strong>כתובת:</strong> {normalizedOrder.pickupReturn.pickupAddress}</p>
                                            </div>
                                        </div>
                                        <div className="return-details-admin">
                                            <h7>החזרה</h7>
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
                                    סטטוס חברות
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

                            {/* NEW: Pickup/Return Confirmation Status */}
                            {(normalizedOrder.pickupConfirmation || normalizedOrder.returnConfirmation) && (
                                <div className="confirmation-status-section">
                                    <h6 className="section-subtitle">
                                        סטטוס איסוף והחזרה
                                    </h6>
                                    
                                    {normalizedOrder.pickupConfirmation && (
                                        <div className="confirmation-card pickup-confirmed">
                                            <div className="confirmation-header">
                                                <PickupIcon />
                                                <span>איסוף אושר</span>
                                            </div>
                                            <div className="confirmation-details">
                                                <p><strong>תאריך איסוף:</strong> {formatDate(normalizedOrder.pickupConfirmation.confirmedAt)}</p>
                                                <p><strong>אושר על ידי:</strong> {normalizedOrder.pickupConfirmation.confirmedBy}</p>
                                                {normalizedOrder.pickupConfirmation.notes && (
                                                    <p><strong>הערות:</strong> {normalizedOrder.pickupConfirmation.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {normalizedOrder.returnConfirmation && (
                                        <div className="confirmation-card return-confirmed">
                                            <div className="confirmation-header">
                                                <ReturnIcon />
                                                <span>החזרה אושרה</span>
                                            </div>
                                            <div className="confirmation-details">
                                                <p><strong>תאריך החזרה:</strong> {formatDate(normalizedOrder.returnConfirmation.returnedAt)}</p>
                                                <p><strong>אושר על ידי:</strong> {normalizedOrder.returnConfirmation.returnedBy}</p>
                                                <p><strong>חוויה כללית:</strong> {normalizedOrder.returnConfirmation.summaryReport?.overallExperience}</p>
                                                <button 
                                                    className="view-report-btn"
                                                    onClick={() => alert('צפייה בדוח מפורט - לפתח')}
                                                >
                                                    צפה בדוח מפורט
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Products Section */}
                        <div className="section-modern products-section">
                            <h5 className="section-title-modern">
                                מוצרים בהזמנה ({normalizedOrder.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0} פריטים)
                            </h5>
                            <div className="products-list-modern">
                                {normalizedOrder.items && normalizedOrder.items.length > 0 ? normalizedOrder.items.map((item, index) => (
                                    <div key={index} className="product-card-modern">
                                        <div className="product-image-modern">
                                            {item.product?.gcsUrl || item.product?.productImageUrl ? (
                                                <img 
                                                    src={item.product.gcsUrl || item.product.productImageUrl} 
                                                    alt={item.product.name || 'מוצר'}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="product-placeholder-modern" style={{ display: (item.product?.gcsUrl || item.product?.productImageUrl) ? 'none' : 'flex' }}>
                                                ●
                                            </div>
                                        </div>
                                        <div className="product-details-modern">
                                            <h6 className="product-name-modern">
                                                {item.product?.name || 'שם מוצר לא זמין'}
                                                {item.quantity > 1 && (
                                                    <span className="product-quantity-badge">×{item.quantity}</span>
                                                )}
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
                                                        {item.quantity > 1 && (
                                                            <span className="price-quantity"> × {item.quantity} = ₪{item.product.price * item.quantity}</span>
                                                        )}
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

                    {/* Action Buttons for Different Order Status */}
                    {normalizedOrder.status === 'Pending' && (
                        <div className="decision-actions-modern">
                            <button 
                                onClick={() => onAccept(normalizedOrder._id)}
                                className="decision-btn-modern accept-btn"
                            >
                                <span className="btn-icon">✓</span>
                                <span className="btn-text">אשר הזמנה</span>
                            </button>
                            <button 
                                onClick={() => onReject(normalizedOrder._id)}
                                className="decision-btn-modern reject-btn"
                            >
                                <span className="btn-icon">✗</span>
                                <span className="btn-text">דחה הזמנה</span>
                            </button>
                        </div>
                    )}

                    {/* NEW: Pickup Confirmation for Accepted Orders */}
                    {normalizedOrder.status === 'Accepted' && (
                        <div className="decision-actions-modern">
                            <button 
                                onClick={() => onConfirmPickup(normalizedOrder)}
                                className="decision-btn-modern pickup-btn"
                            >
                                <span className="btn-icon"><PickupIcon /></span>
                                <span className="btn-text">אשר איסוף פריטים</span>
                            </button>
                        </div>
                    )}

                    {/* NEW: Return Confirmation for PickedUp Orders */}
                    {normalizedOrder.status === 'PickedUp' && (
                        <div className="decision-actions-modern">
                            <button 
                                onClick={() => onConfirmReturn(normalizedOrder)}
                                className="decision-btn-modern return-btn"
                            >
                                <span className="btn-icon"><ReturnIcon /></span>
                                <span className="btn-text">אשר החזרת פריטים</span>
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
            alert('מזהה הזמנה הועתק בהצלחה!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('שגיאה בהעתקה');
        }
    };

    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium order-id-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>מזהה הזמנה</h3>
                    <p>השתמש במזהה זה לעקיבה ותיאום</p>
                </div>
                <div className="order-id-display">
                    <div className="id-container premium">
                        <code className="order-id-code">{orderId}</code>
                        <button onClick={copyToClipboard} className="copy-btn premium">
                            העתק
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
    
    // Safely get customer name with defensive programming
    const getCustomerName = () => {
        const firstName = typeof customer.firstName === 'string' ? customer.firstName : '';
        const lastName = typeof customer.lastName === 'string' ? customer.lastName : '';
        const email = typeof customer.email === 'string' ? customer.email : '';
        
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || email || 'לקוח';
    };
    
    const customerName = getCustomerName();
    
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
                    <h3>פרטי יצירת קשר</h3>
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
                        SMS
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

// ID Image Modal Component
const IdImageModal = ({ imageUrl, fileName, customerName, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium id-image-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>תעודת זהות</h3>
                    <p>{customerName}</p>
                </div>
                
                <div className="modal-body id-image-body">
                    <div className="id-image-container">
                        <img 
                            src={imageUrl} 
                            alt="תעודת זהות"
                            className="id-image-display"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="id-image-error" style={{ display: 'none' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                                <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19M5,6V5H19V6H5Z"/>
                            </svg>
                            <p>לא ניתן לטעון את התמונה</p>
                            <p className="file-name">{fileName}</p>
                        </div>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-close-btn premium">סגור</button>
                    <button 
                        onClick={() => window.open(imageUrl, '_blank')} 
                        className="modal-action-btn premium"
                    >
                        פתח בחלון חדש
                    </button>
                </div>
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
                    <h3>אישור פעולה</h3>
                    <p>אנא אשר את הפעולה שברצונך לבצע</p>
                </div>
                <div className="confirmation-content">
                    <p className="confirmation-message">{message}</p>
                </div>
                <div className="confirmation-actions">
                    <button onClick={onConfirm} className="action-btn premium confirm">כן, בצע</button>
                    <button onClick={onCancel} className="action-btn premium cancel">ביטול</button>
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
    
    // NEW: Pickup and Return Modals
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [currentOrderForPickup, setCurrentOrderForPickup] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [currentOrderForReturn, setCurrentOrderForReturn] = useState(null);

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

    // OPTIMIZED: Single effect to handle all filter changes
    useEffect(() => {
        // Skip if no token available
        if (!token) {
            setError("נדרשת התחברות לצפייה בדף זה.");
            setLoading(false);
            return;
        }

        // Use debounced fetch for search, immediate for other filters
        const params = {
            page: 1, // Always reset to page 1 when filters change
            search: searchText,
            status: activeTab !== 'all' ? activeTab : '',
            quickFilter: quickFilter
        };

        // Clear expanded orders when filters change
        setExpandedOrders(new Set());
        
        // Reset current page
        setCurrentPage(1);

        // Use debouncing for search, immediate for others
        if (searchText !== undefined && searchText !== '') {
            debouncedFetch(params);
        } else {
            fetchOrders(params);
        }
    }, [searchText, activeTab, quickFilter, token, debouncedFetch]);

    // Separate effect for pagination only (no debouncing needed)
    useEffect(() => {
        if (currentPage > 1) {
            fetchOrders({ page: currentPage });
        }
    }, [currentPage]);

    // Initial fetch only
    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    // Fetch orders with pagination and filters - optimized with useCallback
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

    // Helper function to scroll to results section smoothly
    const scrollToResults = () => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Event handlers - optimized with useCallback to prevent re-renders
    const handleSearchTextChange = useCallback((newSearchText) => {
        setSearchText(newSearchText);
    }, []);

    const handleSearchEnter = useCallback(() => {
        scrollToResults(); // Scroll to results when Enter is pressed in search
    }, []);

    const handleTabChange = useCallback((newTab) => {
        setActiveTab(newTab);
        // No scroll needed - tabs are at top of screen
    }, []);

    const handleQuickFilter = useCallback((filterType) => {
        const newFilter = quickFilter === filterType ? '' : filterType;
        setQuickFilter(newFilter);
        // No scroll needed - filters are at top of screen
    }, [quickFilter]);

    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
        scrollToResults(); // Scroll to results when changing numbered pages
    }, []);

    const handleClearAllFilters = useCallback(() => {
        setSearchText('');
        setQuickFilter('');
        setActiveTab('all');
        setCurrentPage(1);
        setExpandedOrders(new Set());
        // No scroll needed - user initiated action from filters at top
    }, []);

    const handleToggleExpand = useCallback((orderId) => {
        setExpandedOrders(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(orderId)) {
                newExpanded.delete(orderId);
            } else {
                newExpanded.add(orderId);
            }
            return newExpanded;
        });
    }, []);

    const handleShowCustomerContact = useCallback((customer) => {
        setCurrentCustomerForModal(customer);
        setShowCustomerContactModal(true);
    }, []);

    const handleShowOrderId = useCallback((orderId) => {
        setCurrentOrderIdForModal(orderId);
        setShowOrderIdModal(true);
    }, []);

    const handleShowMembership = useCallback((customer) => {
        setCurrentCustomerForMembership(customer);
        setShowMembershipModal(true);
    }, []);

    const handleMembershipUpdate = useCallback(() => {
        // Refresh orders to get updated membership data
        fetchOrders();
    }, [fetchOrders]);

    const handleAccept = useCallback((orderId) => {
        setConfirmationAction({
            orderId,
            newStatus: 'Accepted',
            message: 'האם אתה בטוח שברצונך לאשר הזמנה זו? הפעולה תשלח הודעה ללקוח.'
        });
        setShowConfirmationModal(true);
    }, []);

    const handleReject = useCallback((orderId) => {
        setConfirmationAction({
            orderId,
            newStatus: 'Rejected',
            message: 'האם אתה בטוח שברצונך לדחות הזמנה זו? הפעולה תשלח הודעה ללקוח.'
        });
        setShowConfirmationModal(true);
    }, []);

    // NEW: Pickup Confirmation Handler
    const handleConfirmPickup = useCallback((order) => {
        setCurrentOrderForPickup(order);
        setShowPickupModal(true);
    }, []);

    // NEW: Return Confirmation Handler
    const handleConfirmReturn = useCallback((order) => {
        setCurrentOrderForReturn(order);
        setShowReturnModal(true);
    }, []);

    // NEW: Pickup Success Handler
    const handlePickupSuccess = useCallback(() => {
        setShowPickupModal(false);
        setCurrentOrderForPickup(null);
        // Refresh orders to show updated status
        fetchOrders();
    }, [fetchOrders]);

    // NEW: Return Success Handler
    const handleReturnSuccess = useCallback(() => {
        setShowReturnModal(false);
        setCurrentOrderForReturn(null);
        // Refresh orders to show updated status
        fetchOrders();
    }, [fetchOrders]);

    const handleConfirmAction = useCallback(async () => {
        if (!confirmationAction || !token) return;
        
        try {
            const staffName = user?.firstName && user?.lastName ? 
                `${user.firstName} ${user.lastName}` : 'Unknown Staff';
            
            const updatedOrder = await updateOrderStatusAsAdmin(
                confirmationAction.orderId, 
                confirmationAction.newStatus, 
                token,
                staffName,
                'Status updated via admin panel'
            );

            // Update the order in the current page
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === updatedOrder.order?._id ? updatedOrder.order : o)
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
    }, [confirmationAction, token, user, fetchOrders]);

    const handleCancelAction = useCallback(() => {
        setShowConfirmationModal(false);
        setConfirmationAction(null);
    }, []);

    const hasActiveFilters = searchText || quickFilter || activeTab !== 'all';

    // Calculate stats for tabs using API statistics
    const tabCounts = statistics?.tabCounts || {
        all: 0,
        pending: 0,
        ongoing: 0,
        accepted: 0,
        completed: 0,
        rejected: 0
    };

    if (loading && !orders.length) return (
        <div className="loading-screen premium">
            <div className="loading-content">
                <div className="loading-spinner">טוען...</div>
                <h3>טוען הזמנות...</h3>
                <p>אנא המתן בזמן שאנו טוענים את המידע</p>
            </div>
        </div>
    );
    
    if (error && !loading && !orders.length) return (
        <div className="error-screen premium">
            <div className="error-content">
                <div className="error-icon">✗</div>
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
                        <h1>מערכת ניהול השכרות</h1>
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
                        <h4>סטטוס הזמנות</h4>
                        <p>סינון מתקדם לפי סטטוס הזמנה</p>
                    </div>
                    <div className="tabs-container">
                        <button 
                            onClick={() => handleTabChange('all')}
                            className={`tab-btn premium ${activeTab === 'all' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">●</span>
                            <span className="tab-text">הכל</span>
                            <span className="tab-count">({tabCounts.all})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('Pending')}
                            className={`tab-btn premium ${activeTab === 'Pending' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">●</span>
                            <span className="tab-text">ממתינות</span>
                            <span className="tab-count">({tabCounts.pending})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('ongoing')}
                            className={`tab-btn premium ${activeTab === 'ongoing' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">●</span>
                            <span className="tab-text">פעילות</span>
                            <span className="tab-count">({tabCounts.ongoing})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('Accepted')}
                            className={`tab-btn premium ${activeTab === 'Accepted' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">✓</span>
                            <span className="tab-text">מאושרות</span>
                            <span className="tab-count">({tabCounts.accepted})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('Completed')}
                            className={`tab-btn premium ${activeTab === 'Completed' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">📁</span>
                            <span className="tab-text">ארכיון</span>
                            <span className="tab-count">({tabCounts.completed})</span>
                        </button>
                        <button 
                            onClick={() => handleTabChange('Rejected')}
                            className={`tab-btn premium ${activeTab === 'Rejected' ? 'active' : ''}`}
                        >
                            <span className="tab-icon">✗</span>
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
                            <div className="no-orders-icon">?</div>
                            <h3>לא נמצאו הזמנות</h3>
                            <p>נסה לשנות את מסנני החיפוש או לנקות את כל הפילטרים</p>
                            {hasActiveFilters && (
                                <button onClick={handleClearAllFilters} className="clear-filters-btn premium">
                                    נקה פילטרים
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="orders-container premium">
                        <div className="orders-header">
                            <h3>הזמנות</h3>
                            {paginationData && (
                                <p>הצגת {orders.length} הזמנות מתוך {paginationData.totalOrders} סה"כ</p>
                            )}
                            {loading && (
                                <div className="loading-indicator">
                                    <span>טוען...</span>
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
                                    onConfirmPickup={handleConfirmPickup}
                                    onConfirmReturn={handleConfirmReturn}
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

            {/* NEW: Pickup Confirmation Modal */}
            {showPickupModal && currentOrderForPickup && (
                <PickupConfirmationModal
                    order={currentOrderForPickup}
                    onClose={() => {
                        setShowPickupModal(false);
                        setCurrentOrderForPickup(null);
                    }}
                    onSuccess={handlePickupSuccess}
                />
            )}

            {/* NEW: Return Confirmation Modal */}
            {showReturnModal && currentOrderForReturn && (
                <ReturnConfirmationModal
                    order={currentOrderForReturn}
                    onClose={() => {
                        setShowReturnModal(false);
                        setCurrentOrderForReturn(null);
                    }}
                    onSuccess={handleReturnSuccess}
                />
            )}
        </div>
    );
};

export default ManageRentalsPage;
