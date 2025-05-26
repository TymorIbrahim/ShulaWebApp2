import React, { useState } from "react";
import "./FastCheckoutConfirmation.css";

const FastCheckoutConfirmation = ({ 
  cartItems, 
  checkoutData, 
  total, 
  onNext, 
  onPrev, 
  calculateItemPrice,
  processOrder
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const totalWithTax = total * 1.17;

  const handleFastConfirm = async () => {
    try {
      setProcessing(true);
      setError("");
      
      // Process the order
      if (processOrder) {
        await processOrder();
      }
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Move to next step (order confirmation)
      onNext();
    } catch (err) {
      console.error("Error processing order:", err);
      setError("שגיאה בעיבוד ההזמנה. אנא נסה שוב.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fast-checkout-confirmation">
      <div className="step-header">
        <h2>⚡ אישור מהיר</h2>
        <p>כל הפרטים שלך כבר קיימים במערכת - פשוט אשר והזמן!</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className="fast-checkout-content">
        <div className="welcome-back-section">
          <div className="welcome-icon">🎉</div>
          <h3>ברוך השב, {checkoutData.customerInfo?.firstName}!</h3>
          <p>
            מצאנו את כל הפרטים שלך במערכת. תוכל לאשר את ההזמנה במהירות 
            ללא צורך למלא שוב את הפרטים.
          </p>
        </div>

        <div className="pre-filled-info">
          <h3>📋 פרטים שנשמרו במערכת</h3>
          
          <div className="info-sections">
            <div className="info-section">
              <h4>👤 פרטים אישיים</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">שם:</span>
                  <span>{checkoutData.customerInfo?.firstName} {checkoutData.customerInfo?.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="label">אימייל:</span>
                  <span>{checkoutData.customerInfo?.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">טלפון:</span>
                  <span>{checkoutData.customerInfo?.phone}</span>
                </div>
                <div className="info-item">
                  <span className="label">תעודת זהות:</span>
                  <span>{checkoutData.customerInfo?.idNumber}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>✍️ הסכם השכירות</h4>
              <div className="contract-status">
                {checkoutData.contract?.signed ? (
                  <div className="status-item success">
                    <span className="status-icon">✅</span>
                    <span>הסכם נחתם דיגיטלית ב-{formatDate(checkoutData.contract.signedAt)}</span>
                  </div>
                ) : (
                  <div className="status-item pending">
                    <span className="status-icon">⏳</span>
                    <span>נדרשת חתימה על הסכם</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-section">
              <h4>📄 תעודת זהות</h4>
              <div className="id-status">
                {checkoutData.idUpload?.uploaded ? (
                  <div className="status-item success">
                    <span className="status-icon">✅</span>
                    <span>תעודת זהות אומתה ({checkoutData.idUpload.fileName})</span>
                  </div>
                ) : (
                  <div className="status-item pending">
                    <span className="status-icon">⏳</span>
                    <span>נדרשת העלאת תעודת זהות</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-summary-fast">
          <h3>🛒 פריטים להזמנה</h3>
          <div className="items-list">
            {cartItems.map((item, index) => (
              <div key={index} className="fast-item">
                <div className="item-image">
                  <img 
                    src={item.product.productImageUrl || "/placeholder-image.png"} 
                    alt={item.product.name}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <div className="rental-period">
                    📅 {formatDate(item.rentalPeriod.startDate)} - {formatDate(item.rentalPeriod.endDate)}
                  </div>
                </div>
                <div className="item-price">
                  {formatPrice(calculateItemPrice(item))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pickup-return-fast">
          <h3>📍 פרטי איסוף והחזרה</h3>
          <div className="pickup-return-grid">
            <div className="pickup-details">
              <h4>🚚 איסוף</h4>
              <p><strong>תאריך:</strong> {formatDate(checkoutData.pickupReturn?.pickupDate)}</p>
              <p><strong>שעה:</strong> {checkoutData.pickupReturn?.pickupTime}</p>
              <p><strong>כתובת:</strong> {checkoutData.pickupReturn?.pickupAddress}</p>
            </div>
            <div className="return-details">
              <h4>🔄 החזרה</h4>
              <p><strong>תאריך:</strong> {formatDate(checkoutData.pickupReturn?.returnDate)}</p>
              <p><strong>שעה:</strong> {checkoutData.pickupReturn?.returnTime}</p>
              <p><strong>כתובת:</strong> {checkoutData.pickupReturn?.returnAddress}</p>
            </div>
          </div>
        </div>

        <div className="total-section-fast">
          <h3>💰 סיכום תשלום</h3>
          <div className="total-breakdown">
            <div className="total-row">
              <span>סכום ביניים:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="total-row">
              <span>מע"מ (17%):</span>
              <span>{formatPrice(total * 0.17)}</span>
            </div>
            <div className="total-row final">
              <span>סה"כ לתשלום במזומן:</span>
              <span>{formatPrice(totalWithTax)}</span>
            </div>
          </div>
        </div>

        <div className="fast-checkout-notice">
          <div className="notice-icon">🚀</div>
          <div className="notice-content">
            <h4>תהליך מהיר!</h4>
            <p>
              כל הפרטים שלך כבר קיימים במערכת מהזמנות קודמות. 
              לחץ "אשר הזמנה" כדי לסיים את התהליך.
            </p>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className={`btn-primary fast-confirm-btn ${processing ? 'processing' : ''}`}
          onClick={handleFastConfirm}
          disabled={processing}
        >
          {processing ? (
            <>
              <span className="loading-spinner"></span>
              מעבד הזמנה...
            </>
          ) : (
            "🚀 אשר הזמנה מהיר →"
          )}
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
          disabled={processing}
        >
          ← חזור לסיכום
        </button>
      </div>
    </div>
  );
};

export default FastCheckoutConfirmation; 