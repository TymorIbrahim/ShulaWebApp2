import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './CustomerProfile.css';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'; // Import the modal

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

const CustomerProfile = () => {
  const { user, loginUser, isAuthenticated, authReady, token } = useAuth();
  const navigate = useNavigate();
  const {
    profileData,
    orders,
    pagination,
    loading,
    error,
    success,
    fetchProfile,
    updateProfile,
    setProfileData,
    setOrders,
    setSuccess,
    setError
  } = useCustomerProfile();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [orderCancelling, setOrderCancelling] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [orderSort, setOrderSort] = useState({ field: 'createdAt', order: 'desc' });
  
  useEffect(() => {
    if (authReady && !isAuthenticated) {
      navigate('/login');
    }
  }, [authReady, isAuthenticated, navigate]);

  useEffect(() => {
    if (profileData) {
      setProfileData(profileData);
    }
  }, [profileData, setProfileData]);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setIsModalOpen(true);
  };

  const closeCancelModal = () => {
    setOrderToCancel(null);
    setIsModalOpen(false);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setOrderCancelling(orderToCancel);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${API_URL}/api/orders/${orderToCancel}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderToCancel ? { ...order, status: 'Cancelled' } : order
        )
      );
      setSuccess('Order cancelled successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling order.');
    } finally {
      setOrderCancelling(null);
      closeCancelModal();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchProfile(newPage);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/api/uploads/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = { token, ...response.data.user };
      loginUser(updatedUser);
      setProfileData(prev => ({ ...prev, profilePic: response.data.user.profilePic }));
      setSuccess('Profile picture updated successfully!');
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    updateProfile(profileData);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordUpdating(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('הסיסמאות החדשות אינן תואמות');
      setPasswordUpdating(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
      setPasswordUpdating(false);
      return;
    }

    try {
      await axios.put(`${API_URL}/api/users/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
      setPasswordUpdating(false);
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

  const sortedOrders = [...orders].sort((a, b) => {
    if (orderSort.field === 'totalValue') {
      return orderSort.order === 'asc' ? a.totalValue - b.totalValue : b.totalValue - a.totalValue;
    }
    return orderSort.order === 'asc' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!authReady || loading) {
    return <div className="profile-loading">Loading Profile...</div>;
  }

  return (
    <div className="customer-profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {profileData?.profilePic ? (
              <img src={profileData.profilePic} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}
              </div>
            )}
          </div>
            <label htmlFor="profile-pic-upload" className="edit-avatar-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.29,4.71,15.29,0.71a1,1,0,0,0-1.42,0L3,11.59V17a1,1,0,0,0,1,1H9.41l10.88-10.88a1,1,0,0,0,0-1.41ZM8,15H5V12l7-7,3,3Z"/></svg>
            </label>
            <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          </div>
        <div className="profile-header-info">
          <h1>{profileData?.firstName} {profileData?.lastName}</h1>
          <p>{profileData?.email}</p>
          <span className="member-since">
            חבר מאז {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Order History</button>
        <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Documents</button>
        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security</button>
      </div>

      <div className="profile-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>עדכון פרטים אישיים</h2>

              {selectedFile && (
                <div className="upload-preview">
                  <p>New profile picture selected: {selectedFile.name}</p>
                  <button onClick={handleProfilePictureUpload} className="btn-primary" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Picture'}
                  </button>
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">שם פרטי</label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileData?.firstName || ''}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">שם משפחה</label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileData?.lastName || ''}
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
                    value={profileData?.email || ''}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">טלפון</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileData?.phone || ''}
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
              <h2>Order History</h2>
              <div className="order-filters">
                <select onChange={(e) => setOrderSort({ ...orderSort, field: e.target.value })}>
                  <option value="createdAt">Sort by Date</option>
                  <option value="totalValue">Sort by Total</option>
                </select>
                <select onChange={(e) => setOrderSort({ ...orderSort, order: e.target.value })}>
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <div className="orders-list">
                {sortedOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order._id);
                  return (
                  <div key={order._id} className="order-card">
                    <div className="order-header" onClick={() => toggleOrderExpansion(order._id)}>
                      <div className="order-info">
                        <h3>Order #{order._id.slice(-6)}</h3>
                        <p>{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="order-summary-short">
                        <div 
                          className="order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </div>
                        <span className="order-card-total">₪{order.totalValue || 0}</span>
                        <span className={`expansion-arrow ${isExpanded ? 'expanded' : ''}`}>&#9660;</span>
                      </div>
                    </div>
                    
                    <div className={`order-details-wrapper ${isExpanded ? 'expanded' : ''}`}>
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
                              <Link to={`/products/${item.product?._id}`} className="product-link">
                                <h4>{item.product?.name}</h4>
                              </Link>
                              <p>
                                {formatDate(item.rentalPeriod?.startDate)} - {formatDate(item.rentalPeriod?.endDate)}
                              </p>
                            </div>
                            <div className="item-.price">
                              ₪{item.price || item.product?.price}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-footer">
                        <div className="order-total">
                          Total: ₪{order.totalValue || 0}
                        </div>
                        {order.status === 'Pending' && (
                          <button
                            className="btn-cancel"
                            onClick={() => openCancelModal(order._id)}
                            disabled={orderCancelling === order._id}
                          >
                            {orderCancelling === order._id ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>My Documents</h2>
              {orders && orders.length > 0 ? (
                <div className="documents-list">
                  {orders.map(order => {
                    const hasDocuments = order.idUpload?.fileUrl || order.contract?.signatureData;
                    return (
                      <div key={order._id} className="document-group">
                        <h4>Documents for Order #{order._id.slice(-6)}</h4>
                        {hasDocuments ? (
                          <ul className="document-links">
                          {order.idUpload?.fileUrl && (
                            <li>
                              <a href={order.idUpload.fileUrl} target="_blank" rel="noopener noreferrer">
                                View Uploaded ID
                              </a>
                            </li>
                          )}
                          {order.contract?.signatureData && (
                            <li>
                              <a href={order.contract.signatureData} target="_blank" rel="noopener noreferrer">
                                View Signed Contract
                              </a>
                            </li>
                          )}
                        </ul>
                        ) : (
                          <p>No documents available for this order.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No orders found, so no documents to display.</p>
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

                <button type="submit" className="btn-primary" disabled={passwordUpdating}>
                  {passwordUpdating ? 'משנה סיסמה...' : 'שנה סיסמה'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={closeCancelModal}
        onConfirm={handleCancelOrder}
        title="Confirm Order Cancellation"
      >
        Are you sure you want to cancel this order? This action cannot be undone.
      </ConfirmDeleteModal>
    </div>
  );
};

export default CustomerProfile; 