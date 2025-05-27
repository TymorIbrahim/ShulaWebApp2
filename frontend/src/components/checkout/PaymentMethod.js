import React, { useState } from "react";
import "./PaymentMethod.css";

const PaymentMethod = ({ data, total, onUpdate, onNext, onPrev, canProceed }) => {
  const [selectedMethod, setSelectedMethod] = useState(data.method);

  const paymentMethods = [
    {
      id: 'cash',
      name: 'מזומן בעת איסוף',
      description: 'תשלום במזומן בעת איסוף הציוד',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
        </svg>
      ),
      recommended: true,
      fees: 0
    },
    {
      id: 'card',
      name: 'כרטיס אשראי',
      description: 'תשלום מקוון מאובטח',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V12H20V18M20,8H4V6H20V8Z"/>
        </svg>
      ),
      recommended: false,
      fees: 2.5
    }
  ];

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    onUpdate({ 
      method,
      paymentStatus: "pending",
      cardData: null
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  return (
    <div className="payment-method-step">
      <div className="step-header">
        <h2>
          <svg className="payment-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V12H20V18M20,8H4V6H20V8Z"/>
          </svg>
          בחירת אמצעי תשלום
        </h2>
        <p>בחר את אמצעי התשלום המועדף עליך</p>
      </div>

      <div className="payment-container">
        {/* Order Summary */}
        <div className="payment-summary">
          <h3>סיכום תשלום</h3>
          <div className="summary-details">
            <div className="summary-row total">
              <span>סה"כ לתשלום:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3>אמצעי תשלום זמינים</h3>
          
          <div className="payment-methods-grid">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''} ${method.recommended ? 'recommended' : ''}`}
                onClick={() => handleMethodSelection(method.id)}
              >
                {method.recommended && (
                  <div className="recommended-badge">
                    <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                    </svg>
                    מומלץ
                  </div>
                )}
                
                <div className="method-icon">
                  {method.icon}
                </div>
                
                <div className="method-info">
                  <h3>{method.name}</h3>
                  <p>{method.description}</p>
                  {method.fees > 0 && (
                    <div className="fees-info">
                      <span className="fee-label">עמלה:</span>
                      <span className="fee-amount">{method.fees}%</span>
                    </div>
                  )}
                </div>
                
                <div className="selection-indicator">
                  {selectedMethod === method.id && (
                    <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Method Details */}
        {selectedMethod && (
          <div className="selected-method-details">
            <div className="details-content">
              <h4>פרטי התשלום שנבחר</h4>
              
              {selectedMethod === "cash" && (
                <div className="cash-details">
                  <div className="cash-info">
                    <h5>
                      <svg className="money-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                      </svg>
                      תשלום במזומן
                    </h5>
                    <div className="cash-instructions">
                      <p><strong>סכום לתשלום:</strong> {formatPrice(total)}</p>
                      <div className="instructions-list">
                        <h6>הוראות חשובות:</h6>
                        <ul>
                          <li>הביאו סכום מדויק בעת האיסוף</li>
                          <li>התשלום יתבצע לפני מסירת הציוד</li>
                          <li>תקבלו קבלה מיידית במקום</li>
                          <li>במקרה של ביטול, החזר יתבצע במקום</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "card" && (
                <div className="online-details">
                  <div className="online-info">
                    <h5>
                      <svg className="card-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,18H4V12H20V18M20,8H4V6H20V8Z"/>
                      </svg>
                      תשלום מקוון
                    </h5>
                    <div className="online-instructions">
                      <p><strong>סכום לחיוב:</strong> {formatPrice(total)}</p>
                      <div className="security-info">
                        <h6>אבטחה ובטיחות:</h6>
                        <ul>
                          <li>
                            <svg className="security-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/>
                            </svg>
                            הצפנה 256-bit SSL
                          </li>
                          <li>
                            <svg className="security-icon" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/>
                            </svg>
                            עמידה בתקני PCI DSS
                          </li>
                          <li>עיבוד דרך מערכות בנקאיות מאובטחות</li>
                          <li>אישור מיידי במייל</li>
                        </ul>
                      </div>
                      <div className="accepted-cards">
                        <h6>כרטיסים מקובלים:</h6>
                        <div className="card-icons">
                          <span className="card-icon">ויזה</span>
                          <span className="card-icon">מאסטרקארד</span>
                          <span className="card-icon">אמריקן אקספרס</span>
                          <span className="card-icon">ישראכרט</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Guarantee */}
        <div className="payment-guarantee">
          <h4>
            <svg className="shield-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/>
            </svg>
            אחריות תשלום
          </h4>
          <div className="guarantee-content">
            <div className="guarantee-item">
              <span className="guarantee-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/>
                </svg>
              </span>
              <div>
                <strong>אבטחה מקסימלית</strong>
                <p>כל העסקאות מוצפנות ומאובטחות</p>
              </div>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                </svg>
              </span>
              <div>
                <strong>החזר כסף מלא</strong>
                <p>במקרה של ביטול עד 24 שעות לפני האיסוף</p>
              </div>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
              </span>
              <div>
                <strong>תמיכה 24/7</strong>
                <p>צוות התמיכה זמין לכל שאלה או בעיה</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className="btn-primary"
          onClick={onNext}
          disabled={!canProceed}
        >
          המשך לתשלום ←
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
        >
          ← חזור להעלאת תעודת זהות
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod; 