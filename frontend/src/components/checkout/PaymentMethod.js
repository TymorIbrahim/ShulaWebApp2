import React, { useState } from "react";
import "./PaymentMethod.css";

const PaymentMethod = ({ data, total, onUpdate, onNext, onPrev, canProceed }) => {
  const [selectedMethod, setSelectedMethod] = useState(data.method);

  const paymentMethods = [
    {
      id: "cash",
      name: "מזומן בעת איסוף",
      icon: "💵",
      description: "תשלום במזומן בעת איסוף הציוד",
      benefits: [
        "ללא עמלות נוספות",
        "תשלום ישיר למוכר",
        "קבלה מיידית",
        "ללא צורך בפרטי אשראי"
      ],
      notes: "יש להביא סכום מדויק בעת האיסוף"
    },
    {
      id: "online",
      name: "תשלום מקוון",
      icon: "💳",
      description: "תשלום מאובטח באמצעות כרטיס אשראי",
      benefits: [
        "תשלום מאובטח ומוצפן",
        "אישור מיידי",
        "ללא צורך בהכנת מזומנים",
        "עסקה מתועדת דיגיטלית"
      ],
      notes: "התשלום יעובד באופן מיידי ובטוח"
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

  const totalWithTax = total * 1.17;

  return (
    <div className="payment-method-step">
      <div className="step-header">
        <h2>💳 בחירת אמצעי תשלום</h2>
        <p>בחר את אמצעי התשלום המועדף עליך</p>
      </div>

      <div className="payment-container">
        {/* Order Summary */}
        <div className="payment-summary">
          <h3>סיכום תשלום</h3>
          <div className="summary-details">
            <div className="summary-row">
              <span>סכום ביניים:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>מע"מ (17%):</span>
              <span>{formatPrice(total * 0.17)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>סה"כ לתשלום:</span>
              <span>{formatPrice(totalWithTax)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h3>אמצעי תשלום זמינים</h3>
          
          <div className="methods-grid">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => handleMethodSelection(method.id)}
              >
                <div className="method-header">
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                  <div className="method-selector">
                    <div className={`radio-button ${selectedMethod === method.id ? 'selected' : ''}`}>
                      {selectedMethod === method.id && <div className="radio-inner"></div>}
                    </div>
                  </div>
                </div>

                <div className="method-benefits">
                  <h5>יתרונות:</h5>
                  <ul>
                    {method.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="method-notes">
                  <span className="notes-icon">💡</span>
                  <span>{method.notes}</span>
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
                    <h5>💵 תשלום במזומן</h5>
                    <div className="cash-instructions">
                      <p><strong>סכום לתשלום:</strong> {formatPrice(totalWithTax)}</p>
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

              {selectedMethod === "online" && (
                <div className="online-details">
                  <div className="online-info">
                    <h5>💳 תשלום מקוון</h5>
                    <div className="online-instructions">
                      <p><strong>סכום לחיוב:</strong> {formatPrice(totalWithTax)}</p>
                      <div className="security-info">
                        <h6>אבטחה ובטיחות:</h6>
                        <ul>
                          <li>🔒 הצפנה 256-bit SSL</li>
                          <li>🛡️ עמידה בתקני PCI DSS</li>
                          <li>🏦 עיבוד דרך מערכות בנקאיות מאובטחות</li>
                          <li>📧 אישור מיידי במייל</li>
                        </ul>
                      </div>
                      <div className="accepted-cards">
                        <h6>כרטיסים מקובלים:</h6>
                        <div className="card-icons">
                          <span className="card-icon">💳 ויזה</span>
                          <span className="card-icon">💳 מאסטרקארד</span>
                          <span className="card-icon">💳 אמריקן אקספרס</span>
                          <span className="card-icon">💳 ישראכרט</span>
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
          <h4>🛡️ אחריות תשלום</h4>
          <div className="guarantee-content">
            <div className="guarantee-item">
              <span className="guarantee-icon">🔒</span>
              <div>
                <strong>אבטחה מקסימלית</strong>
                <p>כל העסקאות מוצפנות ומאובטחות</p>
              </div>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">↩️</span>
              <div>
                <strong>החזר כסף מלא</strong>
                <p>במקרה של ביטול עד 24 שעות לפני האיסוף</p>
              </div>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">📞</span>
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