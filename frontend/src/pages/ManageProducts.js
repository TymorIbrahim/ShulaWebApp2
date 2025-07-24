import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { 
    getProducts, 
    deleteProduct, 
    updateProductInventory,
    getStockStatus,
    getConditionBadge,
    formatPrice 
} from "../services/productService";
import { useAuth } from "../context/AuthContext";
import websocketService from "../services/websocketService";
import "./ManageProducts.css";

// --- SVG Icons ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" />
  </svg>
);

const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" />
  </svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
  </svg>
);

const AddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
  </svg>
);

const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A3,3 0 0,1 15,5V7H18A1,1 0 0,1 19,8V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8A1,1 0 0,1 6,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
  </svg>
);

// Statistics Component
const ProductStatistics = ({ statistics, isConnected, lastUpdated }) => {
    if (!statistics) return null;
    
    const stats = {
        total: statistics.total || 0,
        featured: statistics.featured || 0, 
        lowStock: statistics.lowStock || 0,
        outOfStock: statistics.outOfStock || 0,
        totalInventory: statistics.totalInventory || 0
    };

    return (
        <div className="product-statistics-modern">
            <div className="stats-header">
                <div className="stats-icon">
                    <StatsIcon />
                </div>
                <div className="stats-title-section">
                    <h3>סקירה כללית - מלאי</h3>
                    <div className="realtime-status">
                        <span className="status-label">חיבור זמן אמת:</span>
                        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                            {isConnected ? (
                                <svg className="status-icon connected" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                                </svg>
                            ) : (
                                <svg className="status-icon disconnected" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                                </svg>
                            )}
                        </span>
                    </div>
                </div>
            </div>
            <div className="stats-grid-modern">
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,2A3,3 0 0,1 15,5V7H18A1,1 0 0,1 19,8V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8A1,1 0 0,1 6,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z"/>
                        </svg>
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">סה"כ מוצרים</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
                        </svg>
                    </div>
                    <div className="stat-value">{stats.featured}</div>
                    <div className="stat-label">מומלצים</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                        </svg>
                    </div>
                    <div className="stat-value">{stats.lowStock}</div>
                    <div className="stat-label">מלאי נמוך</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                        </svg>
                    </div>
                    <div className="stat-value">{stats.outOfStock}</div>
                    <div className="stat-label">לא במלאי</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                        </svg>
                    </div>
                    <div className="stat-value">{stats.featured}</div>
                    <div className="stat-label">מומלצים</div>
                </div>
            </div>
        </div>
    );
};

// Admin Notifications Panel Component
const AdminNotificationPanel = ({ notifications, onDismiss }) => {
    if (!notifications || notifications.length === 0) return null;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'low-stock': 
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                );
            case 'out-of-stock': 
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                );
            case 'reservation': 
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                );
            case 'order': 
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A3,3 0 0,1 15,5V7H18A1,1 0 0,1 19,8V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8A1,1 0 0,1 6,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z"/>
                    </svg>
                );
            default: 
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                );
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'low-stock': return '#f59e0b';
            case 'out-of-stock': return '#dc2626';
            case 'reservation': return '#3b82f6';
            case 'order': return '#059669';
            default: return '#6b7280';
        }
    };

    return (
        <div className="admin-notifications-panel">
            <div className="notifications-header">
                <h4>התראות מנהל</h4>
                <span className="notifications-count">{notifications.length}</span>
            </div>
            <div className="notifications-list">
                {notifications.map((notification) => (
                    <div key={notification.id} className="notification-item" style={{ borderLeftColor: getNotificationColor(notification.type) }}>
                        <div className="notification-content">
                            <div className="notification-header">
                                <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
                                <span className="notification-title">{notification.title}</span>
                                <button className="dismiss-btn" onClick={() => onDismiss(notification.id)}>×</button>
                            </div>
                            <p className="notification-message">{notification.message}</p>
                            <small className="notification-time">
                                {new Date(notification.timestamp).toLocaleTimeString('he-IL')}
                            </small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Enhanced Search & Filter Component
const SearchAndFilters = ({ 
    searchText, onSearchTextChange, 
    category, onCategoryChange,
    sortBy, onSortByChange,
    sortOrder, onSortOrderChange,
    inStock, onInStockChange,
    featured, onFeaturedChange,
    condition, onConditionChange,
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
                            placeholder="חפש לפי שם, תיאור, מותג או תגיות..."
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
                {/* Category Filter */}
                <div className="filter-group">
                    <label className="filter-label">
                        <FilterIcon />
                        קטגוריה
                    </label>
                    <select 
                        value={category} 
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">כל הקטגוריות</option>
                        {filters?.categories?.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
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
                        <option value="name">שם</option>
                        <option value="price">מחיר</option>
                        <option value="inventory">מלאי</option>
                        <option value="createdAt">תאריך יצירה</option>
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

                {/* Stock Filter */}
                <div className="filter-group">
                    <label className="filter-label">מלאי</label>
                    <select 
                        value={inStock} 
                        onChange={(e) => onInStockChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">הכל</option>
                        <option value="true">במלאי</option>
                        <option value="false">אזל מהמלאי</option>
                    </select>
                </div>

                {/* Condition Filter */}
                <div className="filter-group">
                    <label className="filter-label">מצב</label>
                    <select 
                        value={condition} 
                        onChange={(e) => onConditionChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">כל המצבים</option>
                        {filters?.conditions?.map(cond => (
                            <option key={cond} value={cond}>
                                {getConditionBadge(cond).label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Featured Filter */}
                <div className="filter-group featured-filter">
                    <label className="filter-checkbox-label">
                        <input
                            type="checkbox"
                            checked={featured === 'true'}
                            onChange={(e) => onFeaturedChange(e.target.checked ? 'true' : '')}
                            className="filter-checkbox"
                        />
                        <span className="checkmark">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                          </svg>
                        </span>
                        מוצרים מומלצים בלבד
                    </label>
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

// Product Card Component
const ProductCard = ({ product, onEdit, onDelete, onShowInfo, onShowQuickInventory }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const stockStatus = getStockStatus(product);
    const conditionBadge = getConditionBadge(product.condition);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = (e) => {
        setImageLoading(false);
        e.target.src = "/placeholder.jpg";
    };

    const formatDescription = (description) => {
        if (!description) return "אין תיאור זמין";
        return description.length > 80 ? `${description.substring(0, 80)}...` : description;
    };

    return (
        <div className={`product-card-enhanced ${stockStatus.status}`}>
            {/* Image Section */}
            <div className="product-image-container">
                {imageLoading && (
                    <div className="image-loading-placeholder">
                        <div className="loading-spinner-small">
                          <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                          </svg>
                        </div>
                    </div>
                )}
                <img
                    src={product.gcsUrl || product.productImageUrl || "/placeholder.jpg"}
                    alt={product.name}
                    className={`product-image-enhanced ${imageLoading ? 'loading' : ''}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
                
                {/* Badges and Overlays */}
                <div className="card-badges">
                    {product.featured && (
                        <div className="featured-badge-enhanced">
                            <span className="badge-icon">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                              </svg>
                            </span>
                            <span className="badge-text">מומלץ</span>
                        </div>
                    )}
                    <div className={`stock-badge ${stockStatus.status}`}>
                        <span className="stock-indicator"></span>
                        <span className="stock-text">{stockStatus.label}</span>
                    </div>
                </div>

                {/* Quick Action Overlay */}
                <div className="quick-actions-overlay">
                    <button 
                        onClick={() => onShowInfo(product)} 
                        className="quick-action-btn view-btn"
                        title="צפה בפרטים מלאים"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => onEdit(product._id)} 
                        className="quick-action-btn edit-btn"
                        title="ערוך מוצר"
                    >
                        <EditIcon />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="product-content-enhanced">
                {/* Header with Name and Price */}
                <div className="product-header-enhanced">
                    <h3 className="product-name-enhanced" title={product.name}>
                        {product.name}
                    </h3>
                    <div className="product-price-enhanced">
                        {formatPrice(product.price)}
                        <span className="price-period">ליום</span>
                    </div>
                </div>

                {/* Description */}
                <p className="product-description" title={product.description}>
                    {formatDescription(product.description)}
                </p>

                {/* Metadata Grid */}
                <div className="product-metadata-grid">
                    <div className="metadata-item">
                        <span className="metadata-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.78 12.45,22 13,22C13.55,22 14.05,21.78 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.45 21.78,11.95 21.41,11.58Z"/>
                          </svg>
                        </span>
                        <div className="metadata-content">
                            <span className="metadata-label">קטגוריה</span>
                            <span className="metadata-value">{product.category}</span>
                        </div>
                    </div>
                    
                    <div className="metadata-item">
                        <span className="metadata-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H20V19M20,15H12V13H20V15M20,11H12V9H20V11Z"/>
                          </svg>
                        </span>
                        <div className="metadata-content">
                            <span className="metadata-label">מותג</span>
                            <span className="metadata-value">{product.brand || 'לא צוין'}</span>
                        </div>
                    </div>
                    
                    <div className="metadata-item">
                        <span className="metadata-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                          </svg>
                        </span>
                        <div className="metadata-content">
                            <span className="metadata-label">מצב</span>
                            <span className="condition-badge-large" style={{ color: conditionBadge.color }}>
                                {conditionBadge.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Inventory Section */}
                <div className="inventory-section-enhanced">
                    <div className="inventory-header-enhanced">
                        <InventoryIcon />
                        <span>מלאי זמין</span>
                    </div>
                    <div className="inventory-display-enhanced">
                        <span className="inventory-count-enhanced">{product.inventory?.totalUnits || 0}</span>
                        <span className="inventory-label-enhanced">יחידות</span>
                        {product.inventory?.minStockAlert && product.inventory.totalUnits <= product.inventory.minStockAlert && (
                            <span className="low-stock-warning">!</span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="product-actions-enhanced">
                    <button 
                        onClick={() => onShowQuickInventory(product)} 
                        className="action-btn-enhanced inventory"
                        title="עדכון מלאי מהיר"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,2A3,3 0 0,1 15,5V7H18A1,1 0 0,1 19,8V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8A1,1 0 0,1 6,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z"/>
                        </svg>
                        <span>עדכן מלאי</span>
                    </button>
                    
                    <button 
                        onClick={() => onDelete(product)} 
                        className="action-btn-enhanced delete"
                        title="מחק מוצר"
                    >
                        <DeleteIcon />
                        <span>מחק</span>
                    </button>
                </div>
            </div>

            {/* Status Indicator Border */}
            <div className={`status-border ${stockStatus.status}`}></div>
        </div>
    );
};

// Pagination Component
const PaginationControls = ({ paginationData, onPageChange }) => {
    if (!paginationData || paginationData.totalPages <= 1) {
        return null;
    }

    const { currentPage, totalPages, hasNextPage, hasPrevPage, totalProducts, pageSize } = paginationData;
    
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = Math.min(currentPage * pageSize, totalProducts);
    
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
                <span>מציג {startItem}-{endItem} מתוך {totalProducts} מוצרים</span>
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

// Quick Product Info Modal Component
const ProductInfoModal = ({ product, onClose, onEdit }) => {
    if (!product) return null;
    
    const stockStatus = getStockStatus(product);
    const conditionBadge = getConditionBadge(product.condition);
    
    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium product-info-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>פרטי מוצר</h3>
                    <p>מידע מפורט על המוצר</p>
                </div>
                
                <div className="modal-body">
                    <div className="product-details-modal">
                        <div className="product-image-section">
                            <img
                                src={product.gcsUrl || product.productImageUrl || "/placeholder.jpg"}
                                alt={product.name}
                                className="product-image-large"
                                onError={(e) => {
                                    e.target.src = "/placeholder.jpg";
                                }}
                            />
                            {product.featured && (
                                <div className="featured-badge-large">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
                                  </svg>
                                  מומלץ
                                </div>
                            )}
                        </div>
                        
                        <div className="product-info-grid">
                            <div className="info-section">
                                <h4>{product.name}</h4>
                                <div className="price-large">{formatPrice(product.price)}</div>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">קטגוריה:</span>
                                <span className="info-value">{product.category}</span>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">מותג:</span>
                                <span className="info-value">{product.brand || 'לא צוין'}</span>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">מצב:</span>
                                <span className="condition-badge-large" style={{ color: conditionBadge.color }}>
                                    {conditionBadge.label}
                                </span>
                            </div>
                            
                            <div className="info-row">
                                <span className="info-label">מלאי:</span>
                                <span className="stock-badge-large" style={{ color: stockStatus.color }}>
                                    {product.inventory?.totalUnits || 0} יחידות - {stockStatus.label}
                                </span>
                            </div>

                            {product.inventory?.minStockAlert && (
                                <div className="info-row">
                                    <span className="info-label">התראת מלאי נמוך:</span>
                                    <span className="info-value">{product.inventory.minStockAlert} יחידות</span>
                                </div>
                            )}
                            
                            {product.description && (
                                <div className="info-section full-width">
                                    <span className="info-label">תיאור:</span>
                                    <div className="description-content">{product.description}</div>
                                </div>
                            )}

                            {product.specifications && (
                                <div className="info-section full-width">
                                    <span className="info-label">מפרטים טכניים:</span>
                                    <div className="description-content">{product.specifications}</div>
                                </div>
                            )}

                            {product.tags && (
                                <div className="info-section full-width">
                                    <span className="info-label">תגיות:</span>
                                    <div className="tags-container">
                                        {(Array.isArray(product.tags) ? product.tags : product.tags.split(',')).map((tag, index) => (
                                            <span key={index} className="tag-badge">{tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="info-section full-width">
                                <span className="info-label">נוצר בתאריך:</span>
                                <span className="info-value">{new Date(product.createdAt).toLocaleDateString('he-IL')}</span>
                            </div>

                            {product.updatedAt && product.updatedAt !== product.createdAt && (
                                <div className="info-section full-width">
                                    <span className="info-label">עודכן לאחרונה:</span>
                                    <span className="info-value">{new Date(product.updatedAt).toLocaleDateString('he-IL')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="modal-actions">
                    <button onClick={() => onEdit(product._id)} className="action-btn premium edit">
                        <EditIcon />
                        ערוך מוצר
                    </button>
                    <button onClick={onClose} className="modal-close-btn premium">סגור</button>
                </div>
            </div>
        </div>
    );
};

// Quick Inventory Update Modal
const QuickInventoryModal = ({ product, onClose, onUpdate }) => {
    const [newInventory, setNewInventory] = useState(product?.inventory?.totalUnits || 0);
    const [newMinAlert, setNewMinAlert] = useState(product?.inventory?.minStockAlert || 1);
    const [loading, setLoading] = useState(false);
    
    if (!product) return null;
    
    const handleUpdate = async () => {
        setLoading(true);
        try {
            await onUpdate(product._id, { 
                totalUnits: parseInt(newInventory), 
                minStockAlert: parseInt(newMinAlert) 
            });
            onClose();
        } catch (error) {
            alert('שגיאה בעדכון המלאי');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay premium" onClick={onClose}>
            <div className="modal-content premium inventory-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>עדכון מלאי מהיר</h3>
                    <p>עדכן את כמות המלאי של {product.name}</p>
                </div>
                
                <div className="inventory-form-modal">
                    <div className="form-group-modal">
                        <label className="form-label-modal">כמות יחידות במלאי</label>
                        <input
                            type="number"
                            value={newInventory}
                            onChange={(e) => setNewInventory(e.target.value)}
                            className="form-input-modal"
                            min="0"
                            autoFocus
                        />
                    </div>
                    
                    <div className="form-group-modal">
                        <label className="form-label-modal">התראת מלאי נמוך</label>
                        <input
                            type="number"
                            value={newMinAlert}
                            onChange={(e) => setNewMinAlert(e.target.value)}
                            className="form-input-modal"
                            min="0"
                        />
                    </div>
                </div>
                
                <div className="modal-actions">
                    <button 
                        onClick={handleUpdate} 
                        disabled={loading}
                        className="action-btn premium save"
                    >
                        {loading ? 'שומר...' : 'שמור שינויים'}
                    </button>
                    <button onClick={onClose} className="modal-close-btn premium">ביטול</button>
                </div>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ product, onConfirm, onCancel }) => {
    if (!product) return null;
    
    return (
        <div className="modal-overlay premium" onClick={onCancel}>
            <div className="modal-content premium delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>אישור מחיקה</h3>
                    <p>פעולה זו אינה ניתנת לביטול</p>
                </div>
                
                <div className="delete-content">
                    <div className="product-preview">
                        <img
                            src={product.gcsUrl || product.productImageUrl || "/placeholder.jpg"}
                            alt={product.name}
                            className="product-image-small"
                        />
                        <div>
                            <h4>{product.name}</h4>
                            <p>קטגוריה: {product.category}</p>
                        </div>
                    </div>
                    <p className="warning-text">
                        האם אתה בטוח שברצונך למחוק את המוצר "{product.name}"?
                        <br />
                        <strong>לא ניתן יהיה לשחזר את המוצר לאחר המחיקה.</strong>
                    </p>
                </div>
                
                <div className="modal-actions">
                    <button onClick={onConfirm} className="action-btn premium delete-confirm">
                        כן, מחק מוצר
                    </button>
                    <button onClick={onCancel} className="modal-close-btn premium">ביטול</button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const ManageProducts = () => {
    const { user, token } = useAuth();
    // State
    const [products, setProducts] = useState([]);
    const [paginationData, setPaginationData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [filters, setFilters] = useState({ categories: [], conditions: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Real-time WebSocket state
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [adminNotifications, setAdminNotifications] = useState([]);

    // Filter State
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [inStock, setInStock] = useState('');
    const [featured, setFeatured] = useState('');
    const [condition, setCondition] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [showProductInfoModal, setShowProductInfoModal] = useState(false);
    const [showQuickInventoryModal, setShowQuickInventoryModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentProductForModal, setCurrentProductForModal] = useState(null);

    // Refs
    const resultsRef = useRef(null);
    const navigate = useNavigate();

    // WebSocket connection status and real-time updates
    useEffect(() => {
        const handleConnectionStatus = (status) => {
            setIsConnected(status.connected);
        };

        const handleAuthenticated = (data) => {
            console.log('Admin WebSocket authenticated:', data);
            setIsConnected(true);
        };

        const handleInventoryUpdate = (data) => {
            console.log('Admin inventory update:', data);
            
            // Update product in local state
            setProducts(prev => prev.map(product => 
                product._id === data.productId 
                    ? { ...product, inventory: { ...product.inventory, ...data.availability } }
                    : product
            ));

            setLastUpdated(new Date());

            // Update statistics optimistically
            if (statistics) {
                setStatistics(prev => {
                    const product = products.find(p => p._id === data.productId);
                    if (!product) return prev;

                    const oldUnits = product.inventory?.totalUnits || 0;
                    const newUnits = data.availability.totalUnits || 0;
                    const unitDiff = newUnits - oldUnits;

                    return {
                        ...prev,
                        totalInventory: Math.max(0, prev.totalInventory + unitDiff),
                        outOfStock: newUnits === 0 ? prev.outOfStock + 1 : (oldUnits === 0 ? Math.max(0, prev.outOfStock - 1) : prev.outOfStock),
                        lowStock: newUnits <= (data.availability.minStockAlert || 1) && newUnits > 0 
                            ? prev.lowStock + 1 
                            : (oldUnits <= (product.inventory?.minStockAlert || 1) && oldUnits > 0 
                                ? Math.max(0, prev.lowStock - 1) 
                                : prev.lowStock)
                    };
                });
            }
        };

        const handleAdminNotification = (notification) => {
            console.log('Admin notification:', notification);
            setAdminNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification(`Shula Admin: ${notification.title}`, {
                    body: notification.message,
                    icon: '/favicon.ico'
                });
            }
        };

        const handleLowStockAlert = (alert) => {
            console.log('Low stock alert:', alert);
            const notification = {
                id: Date.now(),
                type: 'low-stock',
                title: 'מלאי נמוך',
                message: `המוצר "${alert.productName}" נמצא במלאי נמוך (${alert.currentStock} יחידות)`,
                timestamp: new Date(),
                productId: alert.productId
            };
            setAdminNotifications(prev => [notification, ...prev.slice(0, 4)]);
        };

        // Set up WebSocket listeners
        websocketService.on('connection-status', handleConnectionStatus);
        websocketService.on('authenticated', handleAuthenticated);
        websocketService.on('inventory-update', handleInventoryUpdate);
        websocketService.on('admin-notification', handleAdminNotification);
        websocketService.on('low-stock-alert', handleLowStockAlert);

        // Initialize WebSocket if not connected and we have a token and user is admin
        if (!websocketService.isConnected() && token && user?.role === 'staff') {
            websocketService.initialize(token);
        }

        // Request browser notification permission for admin
        if (user?.role === 'staff' && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            websocketService.off('connection-status', handleConnectionStatus);
            websocketService.off('authenticated', handleAuthenticated);
            websocketService.off('inventory-update', handleInventoryUpdate);
            websocketService.off('admin-notification', handleAdminNotification);
            websocketService.off('low-stock-alert', handleLowStockAlert);
        };
    }, [token, user?.role, products, statistics]);

    // Core fetch function - optimized with useCallback
    const fetchProducts = useCallback(async (overrideParams = {}) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = {
                page: overrideParams.page || currentPage,
                limit: 12,
                search: overrideParams.search !== undefined ? overrideParams.search : searchText,
                category: overrideParams.category !== undefined ? overrideParams.category : category,
                sortBy: overrideParams.sortBy !== undefined ? overrideParams.sortBy : sortBy,
                sortOrder: overrideParams.sortOrder !== undefined ? overrideParams.sortOrder : sortOrder,
                inStock: overrideParams.inStock !== undefined ? overrideParams.inStock : inStock,
                featured: overrideParams.featured !== undefined ? overrideParams.featured : featured,
                condition: overrideParams.condition !== undefined ? overrideParams.condition : condition
            };

            // Remove empty parameters
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                    delete queryParams[key];
                }
            });

            const response = await getProducts(queryParams);

            setProducts(response.products || []);
            setPaginationData(response.pagination || null);
            setStatistics(response.statistics || null);
            setFilters(response.filters || { categories: [], conditions: [] });

        } catch (err) {
            console.error("[ManageProducts] Failed to fetch products:", err);
            setError(err.message || "שגיאה בטעינת המוצרים.");
            setProducts([]);
            setPaginationData(null);
            setStatistics(null);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchText, category, sortBy, sortOrder, inStock, featured, condition]);

    // OPTIMIZED: Single effect to handle all filter changes
    useEffect(() => {
        // Use debounced fetch for search, immediate for other filters
        const params = {
            page: 1, // Always reset to page 1 when filters change
            search: searchText,
            category: category,
            sortBy: sortBy,
            sortOrder: sortOrder,
            inStock: inStock,
            featured: featured,
            condition: condition
        };

        // Reset current page
        setCurrentPage(1);

        // Use debouncing for search, immediate for others
        if (searchText !== undefined && searchText !== '') {
            const timeoutId = setTimeout(() => {
                fetchProducts(params);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            fetchProducts(params);
        }
    }, [searchText, category, sortBy, sortOrder, inStock, featured, condition, fetchProducts]);

    // Separate effect for pagination only (no debouncing needed)
    useEffect(() => {
        if (currentPage > 1) {
            fetchProducts({ page: currentPage });
        }
    }, [currentPage, fetchProducts]);

    // Initial fetch only
    useEffect(() => {
        fetchProducts();
    }, []);

    // Utility functions
    const scrollToResults = () => {
        if (resultsRef.current) {
            resultsRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Event handlers - optimized with useCallback to prevent re-renders
    const handleSearchEnter = useCallback(() => {
        scrollToResults();
    }, []);

    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
        scrollToResults();
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearchText('');
        setCategory('');
        setSortBy('name');
        setSortOrder('asc');
        setInStock('');
        setFeatured('');
        setCondition('');
        setCurrentPage(1);
    }, []);

    // Modal handlers - optimized with useCallback
    const handleShowProductInfo = useCallback((product) => {
        setCurrentProductForModal(product);
        setShowProductInfoModal(true);
    }, []);

    const handleShowQuickInventory = useCallback((product) => {
        setCurrentProductForModal(product);
        setShowQuickInventoryModal(true);
    }, []);

    const handleShowDeleteModal = useCallback((product) => {
        setCurrentProductForModal(product);
        setShowDeleteModal(true);
    }, []);

    const handleCloseModals = useCallback(() => {
        setShowProductInfoModal(false);
        setShowQuickInventoryModal(false);
        setShowDeleteModal(false);
        setCurrentProductForModal(null);
    }, []);

    // CRUD operations - optimized with useCallback
    const handleEdit = useCallback((productId) => {
        navigate(`/admin/products/edit/${productId}`);
    }, [navigate]);

    const handleAdd = useCallback(() => {
        navigate("/admin/products/new");
    }, [navigate]);

    const handleDelete = useCallback(async () => {
        if (!currentProductForModal) return;

        try {
            await deleteProduct(currentProductForModal._id);
            
            // Update local state immediately
            setProducts(prev => prev.filter(p => p._id !== currentProductForModal._id));
            
            // Update statistics optimistically
            setStatistics(prev => {
                if (!prev) return prev;
                
                const deletedProduct = currentProductForModal;
                const units = deletedProduct.inventory?.totalUnits || 0;
                
                return {
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                    totalInventory: Math.max(0, prev.totalInventory - units),
                    outOfStock: units === 0 ? Math.max(0, prev.outOfStock - 1) : prev.outOfStock,
                    lowStock: units <= (deletedProduct.inventory?.minStockAlert || 1) && units > 0 
                        ? Math.max(0, prev.lowStock - 1) 
                        : prev.lowStock,
                    featured: deletedProduct.featured ? Math.max(0, prev.featured - 1) : prev.featured
                };
            });
            
            handleCloseModals();
            
        } catch (err) {
            if (err.response?.data?.message?.includes('active orders')) {
                alert("לא ניתן למחוק מוצר עם הזמנות פעילות");
            } else {
                alert("שגיאה במחיקת המוצר");
            }
            console.error(err);
        }
    }, [currentProductForModal, handleCloseModals]);

    const handleUpdateInventory = useCallback(async (productId, inventoryData) => {
        try {
            await updateProductInventory(productId, inventoryData);
            
            // Update local state immediately
            setProducts(prev => prev.map(p => 
                p._id === productId 
                    ? { ...p, inventory: { ...p.inventory, ...inventoryData } }
                    : p
            ));

            // Emit real-time update via WebSocket
            if (websocketService.isConnected()) {
                const updatedProduct = products.find(p => p._id === productId);
                if (updatedProduct) {
                    const availability = {
                        totalUnits: inventoryData.totalUnits,
                        minStockAlert: inventoryData.minStockAlert,
                        availableNow: inventoryData.totalUnits - (updatedProduct.inventory?.reservedUnits || 0),
                        lastUpdated: new Date()
                    };
                    
                    websocketService.emitInventoryUpdate(productId, availability);
                    console.log('📡 Admin inventory update broadcasted:', { productId, availability });
                }
            }

            // Update statistics optimistically
            setStatistics(prev => {
                if (!prev) return prev;
                
                const oldProduct = products.find(p => p._id === productId);
                const oldUnits = oldProduct?.inventory?.totalUnits || 0;
                const newUnits = inventoryData.totalUnits;
                const unitDiff = newUnits - oldUnits;
                
                return {
                    ...prev,
                    totalInventory: Math.max(0, prev.totalInventory + unitDiff),
                    outOfStock: newUnits === 0 ? prev.outOfStock + 1 : (oldUnits === 0 ? Math.max(0, prev.outOfStock - 1) : prev.outOfStock),
                    lowStock: newUnits <= (inventoryData.minStockAlert || 1) && newUnits > 0 
                        ? prev.lowStock + 1 
                        : (oldUnits <= (oldProduct?.inventory?.minStockAlert || 1) && oldUnits > 0 
                            ? Math.max(0, prev.lowStock - 1) 
                            : prev.lowStock)
                };
            });

        } catch (error) {
            throw error;
        }
    }, [products]);

    // Admin notifications handler
    const dismissNotification = (notificationId) => {
        setAdminNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const hasActiveFilters = searchText || category || inStock || featured || condition || 
                           sortBy !== 'name' || sortOrder !== 'asc';

    if (loading && !products.length) return (
        <div className="loading-screen-modern">
            <div className="loading-content">
                <div className="loading-spinner">
                  <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                  </svg>
                </div>
                <h3>טוען מוצרים...</h3>
                <p>אנא המתן בזמן שאנו טוענים את המלאי</p>
            </div>
        </div>
    );

    if (error && !loading && !products.length) return (
        <div className="error-screen-modern">
            <div className="error-content">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </div>
                <h3>שגיאה בטעינת המידע</h3>
                <p>{error}</p>
                <button onClick={() => fetchProducts()} className="retry-btn-modern">נסה שוב</button>
            </div>
        </div>
    );

    return (
        <div className="manage-products-page-modern">
            <header className="page-header-modern">
                <div className="header-content">
                    <div className="title-section">
                        <h1>ניהול מוצרים ומלאי</h1>
                        <p>ניהול חכם ומתקדם של המוצרים והמלאי</p>
                    </div>
                    <div className="header-actions">
                        <button onClick={handleAdd} className="add-product-btn-modern">
                            <AddIcon />
                            <span>הוסף מוצר חדש</span>
                        </button>
                    </div>
                </div>
                <ProductStatistics statistics={statistics} isConnected={isConnected} lastUpdated={lastUpdated} />
            </header>

            {/* Admin Notifications */}
            {user?.role === 'staff' && adminNotifications.length > 0 && (
                <AdminNotificationPanel 
                    notifications={adminNotifications} 
                    onDismiss={dismissNotification} 
                />
            )}

            <div className="controls-section-modern">
                <SearchAndFilters
                    searchText={searchText}
                    onSearchTextChange={setSearchText}
                    category={category}
                    onCategoryChange={setCategory}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    inStock={inStock}
                    onInStockChange={setInStock}
                    featured={featured}
                    onFeaturedChange={setFeatured}
                    condition={condition}
                    onConditionChange={setCondition}
                    filters={filters}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                    onSearchEnter={handleSearchEnter}
                />
            </div>

            <div className="products-section-modern" ref={resultsRef}>
                {!loading && products.length === 0 ? (
                    <div className="no-products-modern">
                        <div className="no-products-content">
                            <div className="no-products-icon">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                              </svg>
                            </div>
                            <h3>לא נמצאו מוצרים</h3>
                            <p>נסה לשנות את מסנני החיפוש או לנקות את כל הפילטרים</p>
                            {hasActiveFilters && (
                                <button onClick={handleClearFilters} className="clear-filters-btn-modern">
                                    נקה פילטרים
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="products-container-modern">
                        <div className="products-header">
                            <h3>מוצרים</h3>
                            {paginationData && (
                                <p>הצגת {products.length} מוצרים מתוך {paginationData.totalProducts} סה"כ</p>
                            )}
                            {loading && (
                                <div className="loading-indicator">
                                    <span>טוען...</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="products-grid-modern">
                            {products.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onEdit={handleEdit}
                                    onDelete={handleShowDeleteModal}
                                    onShowInfo={handleShowProductInfo}
                                    onShowQuickInventory={handleShowQuickInventory}
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
            {showProductInfoModal && currentProductForModal && (
                <ProductInfoModal 
                    product={currentProductForModal} 
                    onClose={handleCloseModals}
                    onEdit={handleEdit}
                />
            )}

            {showQuickInventoryModal && currentProductForModal && (
                <QuickInventoryModal
                    product={currentProductForModal}
                    onClose={handleCloseModals}
                    onUpdate={handleUpdateInventory}
                />
            )}

            {showDeleteModal && currentProductForModal && (
                <DeleteConfirmationModal
                    product={currentProductForModal}
                    onConfirm={handleDelete}
                    onCancel={handleCloseModals}
                />
            )}
        </div>
    );
};

export default ManageProducts;
