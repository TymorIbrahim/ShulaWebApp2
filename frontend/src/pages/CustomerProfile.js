import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomerProfile.css';

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

const CustomerProfile = () => {
  const { user, loginUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePic: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Order history state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePic: user.profilePic || ''
      });
    }
  }, [user]);

  const fetchOrderHistory = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get(`${API_URL}/api/orders/user/${user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Extract orders array from response, handle both array and object responses
      const ordersData = Array.isArray(response.data) ? response.data : (response.data.orders || []);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching order history:', err);
      // Set empty array as fallback
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [user?.token, user?._id]);

  // Load order history
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrderHistory();
    }
  }, [activeTab, user, fetchOrderHistory]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Update user in context
      const updatedUser = { ...user, ...response.data.user };
      loginUser(updatedUser);
      
      setSuccess('פרופיל עודכן בהצלחה!');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בעדכון הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('הסיסמאות החדשות אינן תואמות');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${API_URL}/api/users/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setSuccess('הסיסמה שונתה בהצלחה!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בשינוי הסיסמה');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f39c12';
      case 'Accepted': return '#27ae60';
      case 'Completed': return '#2c3e50';
      case 'Cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'ממתין לאישור';
      case 'Accepted': return 'מאושר';
      case 'Completed': return 'הושלם';
      case 'Cancelled': return 'בוטל';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return <div className="profile-loading">טוען...</div>;
  }

  return (
    <div className="customer-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profileData.profilePic ? (
            <img src={profileData.profilePic} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
            </div>
          )}
        </div>
        <div className="profile-header-info">
          <h1>{profileData.firstName} {profileData.lastName}</h1>
          <p>{profileData.email}</p>
          <span className="member-since">
            חבר מאז {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="icon-user"></i>
          פרטים אישיים
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="icon-history"></i>
          היסטוריית הזמנות
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="icon-lock"></i>
          אבטחה
        </button>
      </div>

      <div className="profile-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>עדכון פרטים אישיים</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">שם פרטי</label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">שם משפחה</label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">אימייל</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">טלפון</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'שומר...' : 'שמור שינויים'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>היסטוריית הזמנות</h2>
              {ordersLoading ? (
                <div className="loading-state">טוען הזמנות...</div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <i className="icon-shopping-bag"></i>
                  <h3>אין הזמנות עדיין</h3>
                  <p>כשתבצע הזמנות, הן יופיעו כאן</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/products')}
                  >
                    התחל לקנות
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3>הזמנה #{order._id.slice(-6)}</h3>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                        <div 
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </div>
                      </div>
                      
                      {/* Membership Notice for In-Person Orders */}
                      {order.metadata?.onboardingChoice === 'in-person' && order.status === 'Pending' && (
                        <div className="membership-notice">
                          <div className="notice-icon">🏢</div>
                          <div className="notice-content">
                            <strong>הזמנה דורשת השלמת חברות במקום</strong>
                            <p>נא להביא תעודת זהות ולחתום על הסכם החברות בעת איסוף הציוד</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="order-items">
                        {order.items?.map((item, index) => (
                          <div key={index} className="order-item">
                            <img 
                              src={item.product?.productImageUrl || '/placeholder-image.png'} 
                              alt={item.product?.name}
                            />
                            <div className="item-details">
                              <h4>{item.product?.name}</h4>
                              <p>
                                {formatDate(item.rentalPeriod?.startDate)} - {formatDate(item.rentalPeriod?.endDate)}
                              </p>
                            </div>
                            <div className="item-price">
                              ₪{item.price || item.product?.price}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-footer">
                        <div className="order-total">
                          סה"כ: ₪{order.totalValue || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>שינוי סיסמה</h2>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">סיסמה נוכחית</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">סיסמה חדשה</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                    minLength="6"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">אישור סיסמה חדשה</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                    minLength="6"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'משנה סיסמה...' : 'שנה סיסמה'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile; 