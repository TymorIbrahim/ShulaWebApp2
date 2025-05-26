import React, { useState, useEffect } from "react";
import "./PaymentProcessing.css";

const PaymentProcessing = ({ data, total, onUpdate, onNext, onPrev }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: ""
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const totalWithTax = total * 1.17;

  const validateCard = () => {
    const newErrors = {};
    
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
      newErrors.cardNumber = "מספר כרטיס לא תקין";
    }
    
    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = "תאריך תפוגה לא תקין (MM/YY)";
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      newErrors.cvv = "CVV לא תקין";
    }
    
    if (!cardDetails.cardName.trim()) {
      newErrors.cardName = "שם בעל הכרטיס נדרש";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePayment = async () => {
    if (data.method === "online") {
      if (!validateCard()) {
        return;
      }
    }
    
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onUpdate({
        paymentStatus: "completed",
        transactionId: `TXN${Date.now()}`,
        paymentDate: new Date().toISOString(),
        cardData: data.method === "online" ? {
          lastFourDigits: cardDetails.cardNumber.slice(-4),
          cardName: cardDetails.cardName
        } : null
      });
      
      onNext();
    } catch (error) {
      console.error("Payment error:", error);
      setProcessing(false);
      alert("שגיאה בעיבוד התשלום. אנא נסה שוב");
    }
  };

  if (processing) {
    return (
      <div className="payment-processing-step">
        <div className="processing-container">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h2>מעבד תשלום...</h2>
            <p>אנא המתן, אל תרענן את הדף</p>
            <div className="processing-details">
              <p>סכום: {formatPrice(totalWithTax)}</p>
              <p>שיטת תשלום: {data.method === "cash" ? "מזומן" : "כרטיס אשראי"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-processing-step">
      <div className="step-header">
        <h2>💳 עיבוד תשלום</h2>
        <p>השלמת פרטי התשלום</p>
      </div>

      <div className="payment-container">
        {data.method === "cash" ? (
          <div className="cash-confirmation">
            <div className="cash-content">
              <div className="cash-icon">💵</div>
              <h3>תשלום במזומן</h3>
              <div className="cash-details">
                <p className="amount">סכום לתשלום: <strong>{formatPrice(totalWithTax)}</strong></p>
                <div className="cash-instructions">
                  <h4>הוראות לתשלום:</h4>
                  <ul>
                    <li>הביאו את הסכום המדויק בעת האיסוף</li>
                    <li>התשלום יתבצע לפני מסירת הציוד</li>
                    <li>תקבלו קבלה מיידית במקום</li>
                  </ul>
                </div>
                
                <div className="confirmation-checkbox">
                  <label>
                    <input type="checkbox" required />
                    <span>אני מתחייב/ת להביא את הסכום המדויק בעת האיסוף</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-payment">
            <div className="payment-summary">
              <h3>סיכום תשלום</h3>
              <div className="amount">סכום לחיוב: <strong>{formatPrice(totalWithTax)}</strong></div>
            </div>

            <div className="card-form">
              <h3>פרטי כרטיס אשראי</h3>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>מספר כרטיס *</label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={errors.cardNumber ? 'error' : ''}
                  />
                  {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                </div>
                
                <div className="form-group">
                  <label>תאריך תפוגה *</label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength="5"
                    className={errors.expiryDate ? 'error' : ''}
                  />
                  {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                </div>
                
                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength="4"
                    className={errors.cvv ? 'error' : ''}
                  />
                  {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                </div>
                
                <div className="form-group full-width">
                  <label>שם בעל הכרטיס *</label>
                  <input
                    type="text"
                    value={cardDetails.cardName}
                    onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                    placeholder="כפי שמופיע על הכרטיס"
                    className={errors.cardName ? 'error' : ''}
                  />
                  {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                </div>
              </div>
              
              <div className="security-notice">
                <span className="security-icon">🔒</span>
                <span>הפרטים שלך מוגנים בהצפנת SSL 256-bit</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className="btn-primary payment-btn"
          onClick={handlePayment}
          disabled={processing}
        >
          {data.method === "cash" ? "אשר הזמנה" : `שלם ${formatPrice(totalWithTax)}`} ←
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
          disabled={processing}
        >
          ← חזור לבחירת אמצעי תשלום
        </button>
      </div>
    </div>
  );
};

export default PaymentProcessing; 