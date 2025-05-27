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
          <h4>
            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19M5,6V5H19V6H5Z"/>
            </svg>
            פרטים אישיים
          </h4>
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

                      {/* Enhanced Customer Information Section */}
                      {order.customerInfo && (
                        <div className="customer-info-section">
                          <h4>
                            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19M5,6V5H19V6H5Z"/>
                            </svg>
                            פרטים אישיים
                          </h4>
                          <div className="customer-details">
                            <div className="detail-item">
                              <span className="label">שם מלא:</span>
                              <span>{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">אימייל:</span>
                              <span>{order.customerInfo.email}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">טלפון:</span>
                              <span>{order.customerInfo.phone}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">תעודת זהות:</span>
                              <span>
                                {order.customerInfo.idNumber === "PENDING-IN-PERSON" || 
                                 order.customerInfo.idNumber === "WILL_VERIFY_IN_PERSON" ? 
                                  "יאומת בעת איסוף" : 
                                  order.customerInfo.idNumber || "לא זמין"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contract Status Section */}
                      {order.contract && (
                        <div className="contract-status-section">
                          <h4>
                            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"/>
                            </svg>
                            סטטוס הסכם
                          </h4>
                          <div className="contract-details">
                            {order.contract.signed ? (
                              <div className="status-item verified">
                                <span className="status-icon">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                                  </svg>
                                </span>
                                <span>הסכם נחתם דיגיטלית ב-{formatDate(order.contract.signedAt)}</span>
                              </div>
                            ) : order.metadata?.onboardingChoice === "in-person" ? (
                              <div className="status-item pending">
                                <span className="status-icon">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H14V15H12V13H14V11H12V9H20V19M18,11H16V13H18V11M18,15H16V17H18V15Z"/>
                                  </svg>
                                </span>
                                <span>הסכם יחתם בעת איסוף הציוד</span>
                              </div>
                            ) : (
                              <div className="status-item pending">
                                <span className="status-icon">
                                  <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                                  </svg>
                                </span>
                                <span>הסכם לא נחתם</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ID Upload Status Section */}
                      {order.idUpload && (
                        <div className="id-upload-section">
                          <h4>
                            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                            סטטוס תעודת זהות
                          </h4>
                          <div className="id-upload-details">
                            {order.idUpload.uploaded ? (
                              <div className="status-item verified">
                                <span className="status-icon">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                                  </svg>
                                </span>
                                <span>תעודת זהות הועלתה ({order.idUpload.fileName})</span>
                              </div>
                            ) : order.metadata?.onboardingChoice === "in-person" ? (
                              <div className="status-item pending">
                                <span className="status-icon">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H14V15H12V13H14V11H12V9H20V19M18,11H16V13H18V11M18,15H16V17H18V15Z"/>
                                  </svg>
                                </span>
                                <span>תעודת זהות תאומת בעת איסוף הציוד</span>
                              </div>
                            ) : (
                              <div className="status-item pending">
                                <span className="status-icon">
                                  <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                                  </svg>
                                </span>
                                <span>תעודת זהות לא הועלתה</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pickup/Return Information */}
                      {order.pickupReturn && (
                        <div className="pickup-return-section">
                          <h4>
                            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                            </svg>
                            פרטי איסוף והחזרה
                          </h4>
                          <div className="pickup-return-details">
                            <div className="pickup-details">
                              <h5>
                                <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19,8V5A2,2 0 0,0 17,3H7A2,2 0 0,0 5,5V8A3,3 0 0,0 2,11V15A2,2 0 0,0 4,17H5V19A1,1 0 0,0 6,20H8A1,1 0 0,0 9,19V17H15V19A1,1 0 0,0 16,20H18A1,1 0 0,0 19,19V17H20A2,2 0 0,0 22,15V11A3,3 0 0,0 19,8M7,5H17V8H7V5M4,15V11A1,1 0 0,1 5,10H19A1,1 0 0,1 20,11V15H4Z"/>
                                </svg>
                                איסוף
                              </h5>
                              <p><strong>תאריך:</strong> {formatDate(order.pickupReturn.pickupDate)}</p>
                              <p><strong>שעה:</strong> {order.pickupReturn.pickupTime}</p>
                              <p><strong>כתובת:</strong> {order.pickupReturn.pickupAddress}</p>
                            </div>
                            <div className="return-details">
                              <h5>
                                <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12H4A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"/>
                                </svg>
                                החזרה
                              </h5>
                              <p><strong>תאריך:</strong> {formatDate(order.pickupReturn.returnDate)}</p>
                              <p><strong>שעה:</strong> {order.pickupReturn.returnTime}</p>
                              <p><strong>כתובת:</strong> {order.pickupReturn.returnAddress}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Membership Notice for In-Person Orders */}
                      {order.metadata?.onboardingChoice === 'in-person' && order.status === 'Pending' && (
                        <div className="membership-notice">
                          <div className="notice-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,7V3H2V21H22V7H12M6,19H4V17H6V19M6,15H4V13H6V15M6,11H4V9H6V11M6,7H4V5H6V7M10,19H8V17H10V19M10,15H8V13H10V15M10,11H8V9H10V11M10,7H8V5H10V7M20,19H12V17H14V15H12V13H14V11H12V9H20V19M18,11H16V13H18V11M18,15H16V17H18V15Z"/>
                            </svg>
                          </div>
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