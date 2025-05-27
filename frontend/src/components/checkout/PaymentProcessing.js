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
              <p>סכום: {formatPrice(total)}</p>
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
        <h2>
          <svg className="payment-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.11,4 20,4Z"/>
          </svg>
          עיבוד תשלום
        </h2>
        <p>השלמת פרטי התשלום</p>
      </div>

      <div className="payment-container">
        {data.method === "cash" ? (
          <div className="cash-confirmation">
            <div className="cash-content">
              <div className="cash-icon">
                <svg className="money-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z"/>
                </svg>
              </div>
              <h3>תשלום במזומן</h3>
              <div className="cash-details">
                <p className="amount">סכום לתשלום: <strong>{formatPrice(total)}</strong></p>
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
              <div className="amount">סכום לחיוב: <strong>{formatPrice(total)}</strong></div>
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
              
              <div className="security-info">
                <span className="security-icon">
                  <svg className="secure-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M10.2,10C10.2,9.2 10.6,8 12,8C13.4,8 13.8,9.2 13.8,10V11H10.2V10Z"/>
                  </svg>
                </span>
                <span>תשלום מאובטח</span>
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
          {data.method === "cash" ? "אשר הזמנה" : `שלם ${formatPrice(total)}`} ←
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