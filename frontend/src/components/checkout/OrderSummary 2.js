import React, { useState } from "react";
import "./OrderSummary.css";

const OrderSummary = ({ 
  cartItems, 
  total, 
  onNext, 
  calculateItemPrice, 
  pickupReturn, 
  isFastCheckout = false,
  onboardingChoice,
  processInPersonOrder
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleInPersonComplete = async () => {
    if (!processInPersonOrder) return;
    
    try {
      setProcessing(true);
      setError("");
      await processInPersonOrder();
    } catch (err) {
      console.error("Error processing in-person order:", err);
      setError("שגיאה ביצירת ההזמנה. אנא נסה שוב.");
    } finally {
      setProcessing(false);
    }
  };

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

  return (
    <div className="order-summary-step">
      <div className="step-header">
        <h2>📋 סיכום הזמנה</h2>
        <p>בדוק את פרטי ההזמנה לפני המעבר לשלב הבא</p>
      </div>

      <div className="summary-container">
        <div className="items-section">
          <h3>פריטים להשכרה</h3>
          <div className="items-list">
            {cartItems.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-image">
                  <img 
                    src={item.product.productImageUrl || "/placeholder-image.png"} 
                    alt={item.product.name}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <p className="item-description">{item.product.description}</p>
                  <div className="rental-period">
                    <span className="period-dates">
                      📅 {formatDate(item.rentalPeriod.startDate)} - {formatDate(item.rentalPeriod.endDate)}
                    </span>
                  </div>
                </div>
                <div className="item-price">
                  {formatPrice(calculateItemPrice(item))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pickup-return-info">
          <h3>פרטי איסוף והחזרה</h3>
          <div className="info-grid">
            <div className="info-card pickup-info">
              <div className="info-header">
                <span className="info-icon">📦</span>
                <h4>איסוף הציוד</h4>
              </div>
              <div className="info-details">
                <p><strong>תאריך:</strong> {formatDate(pickupReturn?.pickupDate)}</p>
                <p><strong>שעה:</strong> {pickupReturn?.pickupTime || "17:00"}</p>
                <p><strong>כתובת:</strong> {pickupReturn?.pickupAddress}</p>
              </div>
            </div>

            <div className="info-card return-info">
              <div className="info-header">
                <span className="info-icon">🔄</span>
                <h4>החזרת הציוד</h4>
              </div>
              <div className="info-details">
                <p><strong>תאריך:</strong> {formatDate(pickupReturn?.returnDate)}</p>
                <p><strong>שעה:</strong> {pickupReturn?.returnTime || "19:00"}</p>
                <p><strong>כתובת:</strong> {pickupReturn?.returnAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-info">
          <h3>פרטי תשלום</h3>
          <div className="payment-method-card">
            <div className="payment-icon">💵</div>
            <div className="payment-details">
              <h4>תשלום במזומן</h4>
              <p>התשלום יתבצע בעת איסוף הציוד</p>
            </div>
          </div>
        </div>

        <div className="pricing-summary">
          <h3>סיכום מחירים</h3>
          <div className="pricing-details">
            <div className="price-row">
              <span>סכום ביניים:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="price-row">
              <span>מע"מ (17%):</span>
              <span>{formatPrice(total * 0.17)}</span>
            </div>
            <div className="price-row total-row">
              <span>סה"כ לתשלום:</span>
              <span>{formatPrice(totalWithTax)}</span>
            </div>
          </div>
        </div>

        <div className="important-notice">
          <div className="notice-header">
            <span className="notice-icon">⚠️</span>
            <h4>הערות חשובות</h4>
          </div>
          <ul className="notice-list">
            <li>הביאו את הסכום המדויק במזומן: <strong>{formatPrice(totalWithTax)}</strong></li>
            <li>הגיעו בזמן הקבוע: בין 17:00-19:00</li>
            <li>הביאו תעודת זהות המתאימה לפרטים שתמלאו</li>
            <li>בדקו את הציוד בעת האיסוף</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className="step-actions">
        {onboardingChoice === "in-person" ? (
          <button 
            type="button"
            className={`btn-primary ${processing ? 'processing' : ''}`}
            onClick={handleInPersonComplete}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="loading-spinner"></span>
                יוצר הזמנה...
              </>
            ) : (
              "🏢 השלם הזמנה להשלמה אישית →"
            )}
          </button>
        ) : (
          <button 
            type="button"
            className="btn-primary"
            onClick={onNext}
          >
            {isFastCheckout ? "המשך לאישור מהיר →" : "המשך לפרטים אישיים →"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderSummary; 