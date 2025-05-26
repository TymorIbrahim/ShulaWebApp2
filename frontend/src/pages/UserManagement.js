// src/pages/UserManagement.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getUsers, 
    deleteUser, 
    updateUser,
    getRoleBadge,
    getSignUpMethodBadge,
    getUserStatusBadge,
    formatUserName,
    formatJoinDate,
    getRelativeJoinTime
} from '../services/userService';
import MembershipModal from '../components/admin/MembershipModal';
import "./UserManagement.css";

// --- SVG Icons ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" />
  </svg>
);

const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" />
  </svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
  </svg>
);

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

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
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

const MembershipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
  </svg>
);

// Helper function to get membership status
const getMembershipStatus = (user) => {
    const membership = user?.membership;
    if (!membership?.isMember) {
        return { 
            status: 'not-member', 
            label: 'לא חבר', 
            icon: '⚠️', 
            color: '#f39c12',
            bgColor: '#fef3cd'
        };
    }
    
    if (membership.membershipType === 'online') {
        if (membership.idVerification?.verified) {
            return { 
                status: 'verified', 
                label: 'חבר מאומת', 
                icon: '✅', 
                color: '#27ae60',
                bgColor: '#d4edda'
            };
        } else {
            return { 
                status: 'pending', 
                label: 'ממתין לאימות', 
                icon: '⏳', 
                color: '#f39c12',
                bgColor: '#fef3cd'
            };
        }
    } else if (membership.membershipType === 'in_person') {
        return { 
            status: 'in-person', 
            label: 'חבר במקום', 
            icon: '🏢', 
            color: '#8e44ad',
            bgColor: '#e8d5f0'
        };
    }
    
    return { 
        status: 'unknown', 
        label: 'סטטוס לא ידוע', 
        icon: '❓', 
        color: '#95a5a6',
        bgColor: '#f8f9fa'
    };
};

// Statistics Component
const UserStatistics = ({ statistics }) => {
    const stats = statistics || {
        total: 0, customers: 0, staff: 0, recentSignups: 0, activeUsers: 0
    };

    return (
        <div className="user-statistics-modern">
            <div className="stats-header">
                <div className="stats-icon">
                    <StatsIcon />
                </div>
                <div className="stats-title-section">
                    <h3>סקירה כללית - משתמשים</h3>
                    <p>נתונים עדכניים על המשתמשים במערכת</p>
                </div>
            </div>
            <div className="stats-grid-modern">
                <div className="stat-card-modern total">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">סה"כ משתמשים</div>
                        <div className="stat-trend">רשומים במערכת</div>
                    </div>
                </div>
                <div className="stat-card-modern customers">
                    <div className="stat-icon">👤</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.customers}</div>
                        <div className="stat-label">לקוחות</div>
                        <div className="stat-trend">משתמשים רגילים</div>
                    </div>
                </div>
                <div className="stat-card-modern staff">
                    <div className="stat-icon">👑</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.staff}</div>
                        <div className="stat-label">צוות</div>
                        <div className="stat-trend">מנהלים ועובדים</div>
                    </div>
                </div>
                <div className="stat-card-modern recent">
                    <div className="stat-icon">🌟</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.recentSignups}</div>
                        <div className="stat-label">נרשמו לאחרונה</div>
                        <div className="stat-trend">30 הימים האחרונים</div>
                    </div>
                </div>
                <div className="stat-card-modern active">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.activeUsers}</div>
                        <div className="stat-label">משתמשים פעילים</div>
                        <div className="stat-trend">עם הזמנות</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Search & Filter Component
const SearchAndFilters = ({ 
    searchText, onSearchTextChange, 
    role, onRoleChange,
    signUpMethod, onSignUpMethodChange,
    sortBy, onSortByChange,
    sortOrder, onSortOrderChange,
    filters, hasActiveFilters, onClearFilters,
    onSearchEnter
}) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearchEnter();
        }
    };

    return (
        <div className="search-filters-modern">
            {/* Search Section */}
            <div className="search-section-modern">
                <div className="search-title">
                    <SearchIcon />
                    <h4>חיפוש מתקדם</h4>
                </div>
                <div className="search-input-container-modern">
                    <div className="search-input-wrapper-modern">
                        <input
                            type="text"
                            placeholder="חפש לפי שם, אימייל או טלפון..."
                            value={searchText}
                            onChange={(e) => onSearchTextChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="search-input-modern"
                        />
                        {searchText && (
                            <button 
                                onClick={() => onSearchTextChange('')} 
                                className="clear-search-btn-modern"
                                title="נקה חיפוש"
                            >
                                <ClearIcon />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Grid */}
            <div className="filters-grid-modern">
                {/* Role Filter */}
                <div className="filter-group">
                    <label className="filter-label">
                        <FilterIcon />
                        תפקיד
                    </label>
                    <select 
                        value={role} 
                        onChange={(e) => onRoleChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">כל התפקידים</option>
                        {filters?.roles?.map(r => (
                            <option key={r} value={r}>
                                {getRoleBadge(r).label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Signup Method Filter */}
                <div className="filter-group">
                    <label className="filter-label">
                        <FilterIcon />
                        שיטת רישום
                    </label>
                    <select 
                        value={signUpMethod} 
                        onChange={(e) => onSignUpMethodChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">כל השיטות</option>
                        {filters?.signUpMethods?.map(method => (
                            <option key={method} value={method}>
                                {getSignUpMethodBadge(method).label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div className="filter-group">
                    <label className="filter-label">
                        <SortIcon />
                        מיון לפי
                    </label>
                    <select 
                        value={sortBy} 
                        onChange={(e) => onSortByChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="createdAt">תאריך הצטרפות</option>
                        <option value="firstName">שם פרטי</option>
                        <option value="lastName">שם משפחה</option>
                        <option value="email">אימייל</option>
                    </select>
                </div>

                {/* Sort Order */}
                <div className="filter-group">
                    <label className="filter-label">כיוון</label>
                    <select 
                        value={sortOrder} 
                        onChange={(e) => onSortOrderChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="asc">עולה</option>
                        <option value="desc">יורד</option>
                    </select>
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <div className="clear-filters-section">
                    <button onClick={onClearFilters} className="clear-filters-btn-modern">
                        <ClearIcon />
                        <span>נקה כל הפילטרים</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// User Card Component
const UserCard = ({ user, onEdit, onDelete, onShowInfo, onShowMembership }) => {
    const [imageLoading, setImageLoading] = useState(false);
    const roleBadge = getRoleBadge(user.role);
    const signUpBadge = getSignUpMethodBadge(user.signUpMethod);
    const statusBadge = getUserStatusBadge(user);
    const membershipStatus = getMembershipStatus(user);
    const userName = formatUserName(user);

    const getInitials = (name) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    const formatRelativeDate = (dateString) => {
        if (!dateString) return 'לא זמין';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'אתמול';
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
        if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
        return `לפני ${Math.floor(diffDays / 365)} שנים`;
    };

    return (
        <div className={`user-card-enhanced ${statusBadge.status}`}>
            {/* Status Indicator Border */}
            <div className={`status-indicator-border ${membershipStatus.status}`}></div>
            
            {/* Header Section */}
            <div className="user-header-enhanced">
                <div className="user-avatar-container">
                    <div 
                        className="user-avatar-enhanced" 
                        style={{ backgroundColor: roleBadge.color }}
                    >
                        {getInitials(userName)}
                    </div>
                    {user.role === 'staff' && (
                        <div className="staff-crown">👑</div>
                    )}
                </div>
                
                <div className="user-info-enhanced">
                    <h3 className="user-name-enhanced" title={userName}>
                        {userName}
                    </h3>
                    <div className="user-email-enhanced" title={user.email}>
                        {user.email}
                    </div>
                    <div className="join-date-relative">
                        {formatRelativeDate(user.createdAt)}
                    </div>
                </div>

                <div className="user-status-enhanced">
                    <div className="status-badge-enhanced" style={{ 
                        color: statusBadge.color, 
                        backgroundColor: statusBadge.bgColor 
                    }}>
                        <span className="status-icon-enhanced">{statusBadge.icon}</span>
                    </div>
                </div>
            </div>

            {/* User Details Grid */}
            <div className="user-details-enhanced">
                <div className="detail-card">
                    <div className="detail-icon">👤</div>
                    <div className="detail-content">
                        <span className="detail-label">תפקיד</span>
                        <div className="role-badge-enhanced" style={{ 
                            color: roleBadge.color,
                            backgroundColor: `${roleBadge.color}15`
                        }}>
                            <span className="badge-icon">{roleBadge.icon}</span>
                            <span className="badge-text">{roleBadge.label}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="detail-icon">🏛️</div>
                    <div className="detail-content">
                        <span className="detail-label">חברות</span>
                        <div className="membership-badge-enhanced" style={{ 
                            color: membershipStatus.color,
                            backgroundColor: membershipStatus.bgColor
                        }}>
                            <span className="badge-icon">{membershipStatus.icon}</span>
                            <span className="badge-text">{membershipStatus.label}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="detail-icon">📝</div>
                    <div className="detail-content">
                        <span className="detail-label">רישום</span>
                        <div className="signup-badge-enhanced" style={{ 
                            color: signUpBadge.color,
                            backgroundColor: signUpBadge.bgColor
                        }}>
                            <span className="badge-icon">{signUpBadge.icon}</span>
                            <span className="badge-text">{signUpBadge.label}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <div className="detail-icon">📞</div>
                    <div className="detail-content">
                        <span className="detail-label">טלפון</span>
                        <span className="detail-value">{user.phone || 'לא צוין'}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="user-stats-enhanced">
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div className="stat-content">
                        <span className="stat-value">{formatJoinDate(user.createdAt)}</span>
                        <span className="stat-label">תאריך הצטרפות</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="user-actions-enhanced">
                <button 
                    onClick={() => onShowInfo(user)} 
                    className="action-btn-enhanced primary"
                    title="צפה בפרטים מלאים"
                >
                    <InfoIcon />
                    <span>פרטים</span>
                </button>
                
                <button 
                    onClick={() => onShowMembership(user)} 
                    className="action-btn-enhanced membership"
                    title="ניהול חברות"
                >
                    <MembershipIcon />
                    <span>חברות</span>
                </button>
                
                <button 
                    onClick={() => onEdit(user)} 
                    className="action-btn-enhanced edit"
                    title="ערוך משתמש"
                >
                    <EditIcon />
                    <span>ערוך</span>
                </button>
                
                <button 
                    onClick={() => onDelete(user)} 
                    className="action-btn-enhanced delete"
                    title="מחק משתמש"
                >
                    <DeleteIcon />
                    <span>מחק</span>
                </button>
            </div>

            {/* Hover Overlay for Quick Actions */}
            <div className="quick-actions-overlay-users">
                <button 
                    onClick={() => onShowInfo(user)} 
                    className="quick-action-btn-users view"
                    title="צפה בפרטים מלאים"
                >
                    <InfoIcon />
                </button>
                <button 
                    onClick={() => onShowMembership(user)} 
                    className="quick-action-btn-users membership"
                    title="ניהול חברות"
                >
                    <MembershipIcon />
                </button>
            </div>
        </div>
    );
};

// Pagination Component
const PaginationControls = ({ paginationData, onPageChange }) => {
    if (!paginationData || paginationData.totalPages <= 1) {
        return null;
    }

    const { currentPage, totalPages, hasNextPage, hasPrevPage, totalUsers, pageSize } = paginationData;
    
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = Math.min(currentPage * pageSize, totalUsers);
    
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
        <div className="pagination-controls-modern">
            <div className="pagination-info">
                <span>מציג {startItem}-{endItem} מתוך {totalUsers} משתמשים</span>
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

// User Info Modal Component
const UserInfoModal = ({ user, onClose, onEdit }) => {
    if (!user) return null;
    
    const roleBadge = getRoleBadge(user.role);
    const signUpBadge = getSignUpMethodBadge(user.signUpMethod);
    const statusBadge = getUserStatusBadge(user);
    const membershipStatus = getMembershipStatus(user);
    const userName = formatUserName(user);
    
    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium user-info-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>👤 פרטי משתמש</h3>
                    <p>מידע מפורט על המשתמש</p>
                </div>
                
                <div className="modal-body">
                    <div className="user-details-modal">
                        <div className="user-profile-section">
                            <div className="user-avatar-large" style={{ backgroundColor: roleBadge.color }}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-profile-info">
                                <h4>{userName}</h4>
                                <div className="status-badge-large" style={{ 
                                    color: statusBadge.color, 
                                    backgroundColor: statusBadge.bgColor 
                                }}>
                                    {statusBadge.icon} {statusBadge.label}
                                </div>
                            </div>
                        </div>
                        
                        <div className="info-grid">
                            <div className="info-section">
                                <h4>📧 פרטי קשר</h4>
                                <div className="info-row">
                                    <span className="info-label">אימייל:</span>
                                    <span className="info-value">{user.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">טלפון:</span>
                                    <span className="info-value">{user.phone || 'לא צוין'}</span>
                                </div>
                            </div>
                            
                            <div className="info-section">
                                <h4>👤 פרטים אישיים</h4>
                                <div className="info-row">
                                    <span className="info-label">שם פרטי:</span>
                                    <span className="info-value">{user.firstName || 'לא צוין'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">שם משפחה:</span>
                                    <span className="info-value">{user.lastName || 'לא צוין'}</span>
                                </div>
                            </div>
                            
                            <div className="info-section">
                                <h4>🏛️ סטטוס חברות</h4>
                                <div className="info-row">
                                    <span className="info-label">סטטוס:</span>
                                    <div className="membership-badge-large" style={{ 
                                        color: membershipStatus.color, 
                                        backgroundColor: membershipStatus.bgColor 
                                    }}>
                                        {membershipStatus.icon} {membershipStatus.label}
                                    </div>
                                </div>
                                {user.membership?.isMember && (
                                    <>
                                        <div className="info-row">
                                            <span className="info-label">תאריך הצטרפות:</span>
                                            <span className="info-value">
                                                {user.membership.membershipDate ? 
                                                    new Date(user.membership.membershipDate).toLocaleDateString('he-IL') : 
                                                    'לא זמין'
                                                }
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">סוג חברות:</span>
                                            <span className="info-value">
                                                {user.membership.membershipType === 'online' ? 'מקוון' : 'במקום'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="info-section">
                                <h4>⚙️ פרטי מערכת</h4>
                                <div className="info-row">
                                    <span className="info-label">תפקיד:</span>
                                    <div className="role-badge-large" style={{ color: roleBadge.color }}>
                                        {roleBadge.icon} {roleBadge.label}
                                    </div>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">הצטרפות:</span>
                                    <div className="signup-badge-large" style={{ 
                                        color: signUpBadge.color, 
                                        backgroundColor: signUpBadge.bgColor 
                                    }}>
                                        {signUpBadge.icon} {signUpBadge.label}
                                    </div>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">תאריך הצטרפות:</span>
                                    <span className="info-value">{formatJoinDate(user.createdAt)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">עדכון אחרון:</span>
                                    <span className="info-value">{formatJoinDate(user.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="modal-actions">
                    <button onClick={() => onEdit(user)} className="action-btn premium edit">
                        ✏️ ערוך משתמש
                    </button>
                    <button onClick={onClose} className="modal-close-btn premium">סגור</button>
                </div>
            </div>
        </div>
    );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'customer'
    });
    const [loading, setLoading] = useState(false);
    
    if (!user) return null;
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(user._id, formData);
            onClose();
        } catch (error) {
            alert('שגיאה בעדכון המשתמש');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium edit-user-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ עריכת משתמש</h3>
                    <p>עדכן את פרטי המשתמש</p>
                </div>
                
                <form onSubmit={handleSubmit} className="edit-user-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">שם פרטי</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">שם משפחה</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">אימייל</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">טלפון</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">תפקיד</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="customer">לקוח</option>
                                <option value="staff">צוות</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="modal-actions">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="action-btn premium save"
                        >
                            {loading ? '💾 שומר...' : '💾 שמור שינויים'}
                        </button>
                        <button type="button" onClick={onClose} className="modal-close-btn premium">ביטול</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ user, onConfirm, onCancel }) => {
    if (!user) return null;
    
    const userName = formatUserName(user);
    
    return (
        <div className="modal-overlay premium" onClick={onCancel}>
            <div className="modal-content premium delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>⚠️ אישור מחיקה</h3>
                    <p>פעולה זו אינה ניתנת לביטול</p>
                </div>
                
                <div className="delete-content">
                    <div className="user-preview">
                        <div className="user-avatar-small">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4>{userName}</h4>
                            <p>{user.email}</p>
                        </div>
                    </div>
                    <p className="warning-text">
                        האם אתה בטוח שברצונך למחוק את המשתמש "{userName}"?
                        <br />
                        <strong>לא ניתן יהיה לשחזר את המשתמש לאחר המחיקה.</strong>
                    </p>
                </div>
                
                <div className="modal-actions">
                    <button onClick={onConfirm} className="action-btn premium delete-confirm">
                        🗑️ כן, מחק משתמש
                    </button>
                    <button onClick={onCancel} className="modal-close-btn premium">ביטול</button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const UserManagement = () => {
    // State
    const [users, setUsers] = useState([]);
    const [paginationData, setPaginationData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [filters, setFilters] = useState({ roles: [], signUpMethods: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter State
    const [searchText, setSearchText] = useState('');
    const [role, setRole] = useState('');
    const [signUpMethod, setSignUpMethod] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [showUserInfoModal, setShowUserInfoModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMembershipModal, setShowMembershipModal] = useState(false);
    const [currentUserForModal, setCurrentUserForModal] = useState(null);

    // Ref for results section
    const resultsRef = useRef(null);
    const navigate = useNavigate();

    // Enhanced fetch function
    const fetchUsers = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = {
                page: params.page || currentPage,
                limit: 12,
                search: params.search !== undefined ? params.search : searchText,
                role: params.role !== undefined ? params.role : role,
                signUpMethod: params.signUpMethod !== undefined ? params.signUpMethod : signUpMethod,
                sortBy: params.sortBy !== undefined ? params.sortBy : sortBy,
                sortOrder: params.sortOrder !== undefined ? params.sortOrder : sortOrder
            };

            // Remove empty parameters
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                    delete queryParams[key];
                }
            });

            console.log('👥 [UserManagement] Fetching users with params:', queryParams);
            const response = await getUsers(queryParams);
            console.log('👥 [UserManagement] API Response received:', response);

            setUsers(response.users || []);
            setPaginationData(response.pagination || null);
            setStatistics(response.statistics || null);
            setFilters(response.filters || { roles: [], signUpMethods: [] });

            if (params.page) {
                setCurrentPage(params.page);
            }

        } catch (err) {
            console.error("❌ [UserManagement] Failed to fetch users:", err);
            setError(err.message || "שגיאה בטעינת המשתמשים.");
            setUsers([]);
            setPaginationData(null);
            setStatistics(null);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchText, role, signUpMethod, sortBy, sortOrder]);

    // Initial fetch
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounced search effect
    useEffect(() => {
        if (searchText !== undefined) {
            const timeoutId = setTimeout(() => {
                fetchUsers({ page: 1, search: searchText });
                setCurrentPage(1);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchText, fetchUsers]);

    // Filter changes effect
    useEffect(() => {
        fetchUsers({ page: 1 });
        setCurrentPage(1);
    }, [role, signUpMethod, sortBy, sortOrder, fetchUsers]);

    // Scroll to results
    const scrollToResults = () => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Event handlers
    const handleSearchEnter = () => {
        scrollToResults();
    };

    const handlePageChange = (newPage) => {
        fetchUsers({ page: newPage });
        scrollToResults();
    };

    const handleClearFilters = () => {
        setSearchText('');
        setRole('');
        setSignUpMethod('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
        fetchUsers({ 
            page: 1, search: '', role: '', signUpMethod: '', 
            sortBy: 'createdAt', sortOrder: 'desc'
        });
    };

    // Modal handlers
    const handleShowUserInfo = (user) => {
        setCurrentUserForModal(user);
        setShowUserInfoModal(true);
    };

    const handleShowEditUser = (user) => {
        setCurrentUserForModal(user);
        setShowEditUserModal(true);
    };

    const handleShowDeleteModal = (user) => {
        setCurrentUserForModal(user);
        setShowDeleteModal(true);
    };

    const handleShowMembership = (user) => {
        setCurrentUserForModal(user);
        setShowMembershipModal(true);
    };

    const handleCloseModals = () => {
        setShowUserInfoModal(false);
        setShowEditUserModal(false);
        setShowDeleteModal(false);
        setShowMembershipModal(false);
        setCurrentUserForModal(null);
    };

    const hasActiveFilters = searchText || role || signUpMethod || 
                           sortBy !== 'createdAt' || sortOrder !== 'desc';

    // CRUD operations
    const handleUpdateUser = async (userId, userData) => {
        try {
            await updateUser(userId, userData);
            
            // Update local state
            setUsers(prev => prev.map(u => 
                u._id === userId ? { ...u, ...userData } : u
            ));

            // Refresh statistics
            setTimeout(() => {
                fetchUsers();
            }, 500);

        } catch (error) {
            throw error;
        }
    };

    const handleDeleteUser = async () => {
        if (!currentUserForModal) return;

        try {
            await deleteUser(currentUserForModal._id);
            setUsers(prev => prev.filter(u => u._id !== currentUserForModal._id));
            handleCloseModals();
            
            // Refresh statistics
            setTimeout(() => {
                fetchUsers();
            }, 500);
        } catch (err) {
            if (err.response?.data?.message?.includes('הזמנות פעילות')) {
                alert(err.response.data.message);
            } else {
                alert("שגיאה במחיקת המשתמש");
            }
            console.error(err);
        }
    };

    const handleMembershipUpdate = () => {
        // Refresh the user data to reflect membership changes
        fetchUsers();
    };

    console.log('👥 [UserManagement] Current render - users state:', users);
    console.log('👥 [UserManagement] Current render - users length:', users.length);
    console.log('👥 [UserManagement] Current render - loading:', loading);
    console.log('👥 [UserManagement] Current render - error:', error);

    if (loading && !users.length) return (
        <div className="loading-screen-modern">
            <div className="loading-content">
                <div className="loading-spinner">⏳</div>
                <h3>טוען משתמשים...</h3>
                <p>אנא המתן בזמן שאנו טוענים את המידע</p>
            </div>
        </div>
    );

    if (error && !loading && !users.length) return (
        <div className="error-screen-modern">
            <div className="error-content">
                <div className="error-icon">❌</div>
                <h3>שגיאה בטעינת המידע</h3>
                <p>{error}</p>
                <button onClick={() => fetchUsers()} className="retry-btn-modern">נסה שוב</button>
            </div>
        </div>
    );

    return (
        <div className="user-management-page-modern">
            <header className="page-header-modern">
                <div className="header-content">
                    <div className="title-section">
                        <h1>👥 ניהול משתמשים</h1>
                        <p>ניהול חכם ומתקדם של המשתמשים במערכת</p>
                    </div>
                </div>
                <UserStatistics statistics={statistics} />
            </header>

            <div className="controls-section-modern">
                <SearchAndFilters
                    searchText={searchText}
                    onSearchTextChange={setSearchText}
                    role={role}
                    onRoleChange={setRole}
                    signUpMethod={signUpMethod}
                    onSignUpMethodChange={setSignUpMethod}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    filters={filters}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                    onSearchEnter={handleSearchEnter}
                />
            </div>

            <div className="users-section-modern" ref={resultsRef}>
                {!loading && users.length === 0 ? (
                    <div className="no-users-modern">
                        <div className="no-users-content">
                            <div className="no-users-icon">🔍</div>
                            <h3>לא נמצאו משתמשים</h3>
                            <p>נסה לשנות את מסנני החיפוש או לנקות את כל הפילטרים</p>
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters} className="clear-filters-btn-modern">
                                    🧹 נקה פילטרים
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="users-container-modern">
                        <div className="users-header">
                            <h3>👥 משתמשים</h3>
                            {paginationData && (
                                <p>הצגת {users.length} משתמשים מתוך {paginationData.totalUsers} סה"כ</p>
                            )}
                            {loading && (
                                <div className="loading-indicator">
                                    <span>⏳ טוען...</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="users-grid-modern">
                            {users.map(user => (
                                <UserCard
                                    key={user._id}
                                    user={user}
                                    onEdit={handleShowEditUser}
                                    onDelete={handleShowDeleteModal}
                                    onShowInfo={handleShowUserInfo}
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
            {showUserInfoModal && currentUserForModal && (
                <UserInfoModal 
                    user={currentUserForModal} 
                    onClose={handleCloseModals}
                    onEdit={handleShowEditUser}
                />
            )}

            {showEditUserModal && currentUserForModal && (
                <EditUserModal
                    user={currentUserForModal}
                    onClose={handleCloseModals}
                    onSave={handleUpdateUser}
                />
            )}

            {showDeleteModal && currentUserForModal && (
                <DeleteConfirmationModal
                    user={currentUserForModal}
                    onConfirm={handleDeleteUser}
                    onCancel={handleCloseModals}
                />
            )}

            {showMembershipModal && currentUserForModal && (
                <MembershipModal
                    customer={currentUserForModal}
                    onClose={handleCloseModals}
                    onMembershipUpdate={handleMembershipUpdate}
                />
            )}
        </div>
    );
};

export default UserManagement;