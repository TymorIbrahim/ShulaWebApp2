import React, { useState, useEffect } from 'react';
import { confirmOrderPickup } from '../../services/orderService';
import './PickupConfirmationModal.css';

const PickupConfirmationModal = ({ order, onClose, onSuccess }) => {
  const [pickupData, setPickupData] = useState({
    confirmedBy: '',
    membershipVerified: false,
    idVerified: false,
    contractSigned: false,
    paymentReceived: false,
    itemsHandedOut: [],
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order?.items) {
      // Initialize items handed out with order items
      const initialItems = order.items.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity || 1,
        condition: 'good',
        notes: ''
      }));
      
      setPickupData(prev => ({
        ...prev,
        itemsHandedOut: initialItems
      }));
    }
  }, [order]);

  const handleInputChange = (field, value) => {
    setPickupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemConditionChange = (index, field, value) => {
    setPickupData(prev => ({
      ...prev,
      itemsHandedOut: prev.itemsHandedOut.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const canConfirmPickup = () => {
    return (
      pickupData.confirmedBy.trim() !== '' &&
      pickupData.membershipVerified &&
      pickupData.idVerified &&
      pickupData.contractSigned &&
      pickupData.paymentReceived
    );
  };

  const handleConfirmPickup = async () => {
    if (!canConfirmPickup()) {
      setError('אנא השלם את כל הדרישות לפני אישור איסוף');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = JSON.parse(localStorage.getItem('user') || '{}').token || 
                   JSON.parse(localStorage.getItem('user') || '{}').accessToken;
      
      await confirmOrderPickup(order._id, pickupData, token);
      
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'שגיאה באישור איסוף ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  const getMembershipStatusInfo = () => {
    const membership = order.user?.membership;
    
    if (!membership?.isMember) {
      return {
        status: 'not-member',
        message: 'הלקוח אינו חבר - יש להשלים תהליך חברות במקום',
        color: '#f39c12'
      };
    }
    
    if (membership.membershipType === 'online' && membership.idVerification?.verified) {
      return {
        status: 'verified',
        message: 'חבר מאומת - ניתן להמשיך',
        color: '#27ae60'
      };
    }
    
    return {
      status: 'pending',
      message: 'חברות ממתינה לאימות - יש לוודא מסמכים',
      color: '#f39c12'
    };
  };

  const membershipInfo = getMembershipStatusInfo();

  if (!order) return null;

  return (
    <div className="modal-overlay pickup-modal-overlay" onClick={onClose}>
      <div className="pickup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>אישור איסוף הזמנה</h2>
          <p>מזהה הזמנה: {order._id}</p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="modal-content">
          {/* Customer Info Section */}
          <div className="section customer-info-section">
            <h3>פרטי לקוח</h3>
            <div className="customer-details">
              <div className="detail-row">
                <span className="label">שם:</span>
                <span className="value">
                  {(typeof order.user?.firstName === 'string' ? order.user.firstName : '')} {(typeof order.user?.lastName === 'string' ? order.user.lastName : '')}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">טלפון:</span>
                <span className="value">{typeof order.user?.phone === 'string' ? order.user.phone : 'לא זמין'}</span>
              </div>
              <div className="detail-row">
                <span className="label">אימייל:</span>
                <span className="value">{typeof order.user?.email === 'string' ? order.user.email : 'לא זמין'}</span>
              </div>
            </div>

            <div className="membership-status" style={{ borderColor: membershipInfo.color }}>
              <h4>סטטוס חברות</h4>
              <div className="membership-message" style={{ color: membershipInfo.color }}>
                {membershipInfo.message}
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="section verification-section">
            <h3>רשימת בדיקות נדרשות</h3>
            
            <div className="verification-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={pickupData.membershipVerified}
                  onChange={(e) => handleInputChange('membershipVerified', e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="label-text">אימות חברות בקהילה</span>
              </label>
              <p className="help-text">וודא שהלקוח הוא חבר פעיל בקהילה</p>
            </div>

            <div className="verification-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={pickupData.idVerified}
                  onChange={(e) => handleInputChange('idVerified', e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="label-text">אימות תעודת זהות</span>
              </label>
              <p className="help-text">בדוק תעודת זהות מול הפרטים במערכת</p>
            </div>

            <div className="verification-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={pickupData.contractSigned}
                  onChange={(e) => handleInputChange('contractSigned', e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="label-text">הסכם השכירות נחתם</span>
              </label>
              <p className="help-text">וודא שהלקוח חתם על הסכם השכירות</p>
            </div>

            <div className="verification-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={pickupData.paymentReceived}
                  onChange={(e) => handleInputChange('paymentReceived', e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="label-text">תשלום התקבל</span>
              </label>
              <p className="help-text">אשר שהתשלום בוצע בהצלחה</p>
            </div>
          </div>

          {/* Items Handed Out */}
          <div className="section items-section">
            <h3>פריטים שנמסרו ({pickupData.itemsHandedOut.reduce((sum, item) => sum + (item.quantity || 1), 0)})</h3>
            
            <div className="items-container">
              {pickupData.itemsHandedOut.map((item, index) => (
                <div key={index} className="item-card">
                <div className="item-header">
                  <h4>{item.productName} {item.quantity > 1 && <span className="quantity-badge">×{item.quantity}</span>}</h4>
                </div>
                
                <div className="item-details">
                  <div className="form-group">
                    <label>מצב הפריט</label>
                    <select
                      value={item.condition}
                      onChange={(e) => handleItemConditionChange(index, 'condition', e.target.value)}
                      className="condition-select"
                    >
                      <option value="excellent">מעולה</option>
                      <option value="good">טוב</option>
                      <option value="fair">בסדר</option>
                      <option value="needs_attention">דורש תשומת לב</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>הערות (אופציונלי)</label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleItemConditionChange(index, 'notes', e.target.value)}
                      placeholder="הערות על מצב הפריט..."
                      className="notes-input"
                    />
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Staff and Notes */}
          <div className="section staff-section">
            <div className="form-group">
              <label htmlFor="confirmedBy">שם איש הצוות המאשר *</label>
              <input
                type="text"
                id="confirmedBy"
                value={pickupData.confirmedBy}
                onChange={(e) => handleInputChange('confirmedBy', e.target.value)}
                placeholder="הכנס את שמך המלא..."
                className="staff-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">הערות כלליות</label>
              <textarea
                id="notes"
                value={pickupData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="הערות נוספות על תהליך האיסוף..."
                className="notes-textarea"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="btn-secondary"
            disabled={loading}
          >
            ביטול
          </button>
          
          <button 
            onClick={handleConfirmPickup}
            className={`btn-primary ${canConfirmPickup() ? '' : 'disabled'}`}
            disabled={loading || !canConfirmPickup()}
          >
            {loading ? 'מאשר...' : 'אשר איסוף הזמנה'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupConfirmationModal; 