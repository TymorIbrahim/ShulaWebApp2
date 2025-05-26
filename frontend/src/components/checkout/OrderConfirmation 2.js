import React from "react";
import "./OrderConfirmation.css";

const OrderConfirmation = ({ 
  checkoutData, 
  cartItems, 
  total, 
  onFinish, 
  onboardingChoice, 
  isFirstTimeCustomer 
}) => {
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

  const getSuccessMessage = () => {
    if (isFirstTimeCustomer) {
      if (onboardingChoice === "in-person") {
        return {
          title: "ההזמנה נוצרה בהצלחה! 🎉",
          subtitle: "ברוכים הבאים לקהילת שירת הים!",
          message: "בחרת להשלים את התהליך אצלנו אישית. נראה אותך בעת איסוף הציוד!"
        };
      } else {
        return {
          title: "ברוכים הבאים לקהילה! 🌊",
          subtitle: "ההזמנה הושלמה בהצלחה!",
          message: "השלמת בהצלחה את תהליך ההצטרפות לקהילת שירת הים. מעתה ההזמנות הבאות יהיו מהירות ופשוטות!"
        };
      }
    } else {
      return {
        title: "ההזמנה אושרה! ✅",
        subtitle: "הכל מוכן לאיסוף",
        message: "תודה על השימוש בשירותי שירת הים. נראה אותך בזמן האיסוף!"
      };
    }
  };

  const successInfo = getSuccessMessage();

  return (
    <div className="order-confirmation-step">
      <div className="confirmation-header">
        <div className="success-icon">✅</div>
        <h2>{successInfo.title}</h2>
        <p className="confirmation-subtitle">{successInfo.subtitle}</p>
        <p className="confirmation-message">{successInfo.message}</p>
      </div>

      <div className="confirmation-content">
        {isFirstTimeCustomer && onboardingChoice === "online" && (
          <div className="welcome-section">
            <h3>🎁 ברוכים הבאים לקהילה!</h3>
            <div className="welcome-benefits">
              <div className="benefit">
                <span className="benefit-icon">⚡</span>
                <p>מעתה ההזמנות שלך יהיו מהירות ופשוטות</p>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💰</span>
                <p>תזכה להנחות חברי קהילה ומבצעים בלעדיים</p>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📱</span>
                <p>תקבל עדכונים על ציוד חדש וטיפים לדיג</p>
              </div>
            </div>
          </div>
        )}

        <div className="order-summary-section">
          <h3>📋 סיכום ההזמנה</h3>
          
          <div className="order-details">
            <div className="order-items">
              <h4>פריטים להשכרה:</h4>
              {cartItems.map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-name">{item.product.name}</span>
                  <span className="item-period">
                    {formatDate(item.rentalPeriod.startDate)} - {formatDate(item.rentalPeriod.endDate)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pickup-details">
              <h4>פרטי איסוף:</h4>
              <div className="pickup-info">
                <p><strong>תאריך איסוף:</strong> {formatDate(checkoutData.pickupReturn?.pickupDate)}</p>
                <p><strong>שעת איסוף:</strong> {checkoutData.pickupReturn?.pickupTime || "17:00"}</p>
                <p><strong>כתובת:</strong> {checkoutData.pickupReturn?.pickupAddress}</p>
              </div>
            </div>

            <div className="return-details">
              <h4>פרטי החזרה:</h4>
              <div className="return-info">
                <p><strong>תאריך החזרה:</strong> {formatDate(checkoutData.pickupReturn?.returnDate)}</p>
                <p><strong>שעת החזרה:</strong> {checkoutData.pickupReturn?.returnTime || "19:00"}</p>
                <p><strong>כתובת:</strong> {checkoutData.pickupReturn?.returnAddress}</p>
              </div>
            </div>

            <div className="payment-summary">
              <h4>פרטי תשלום:</h4>
              <div className="payment-details">
                <div className="payment-row">
                  <span>סכום ביניים:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="payment-row">
                  <span>מע"מ (17%):</span>
                  <span>{formatPrice(total * 0.17)}</span>
                </div>
                <div className="payment-row total">
                  <span>סה"כ לתשלום במזומן:</span>
                  <span>{formatPrice(totalWithTax)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="next-steps-section">
          <h3>📝 השלבים הבאים</h3>
          
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>הכן את הסכום המדויק</strong>
                <p>הביא {formatPrice(totalWithTax)} במזומן (בלי עמלות או עודף)</p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>הגע בזמן הקבוע</strong>
                <p>ב-{formatDate(checkoutData.pickupReturn?.pickupDate)} בשעה {checkoutData.pickupReturn?.pickupTime || "17:00"}</p>
              </div>
            </div>

            {onboardingChoice === "in-person" && (
              <div className="step-item">
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>השלמת התהליך אצלנו</strong>
                  <p>מילוי פרטים אישיים, חתימה על הסכם והצגת תעודת זהות</p>
                </div>
              </div>
            )}

            <div className="step-item">
              <span className="step-number">{onboardingChoice === "in-person" ? "4" : "3"}</span>
              <div className="step-content">
                <strong>קבלת הציוד והדרכה</strong>
                <p>בדיקת הציוד, קבלת טיפים ויציאה לדיג!</p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">{onboardingChoice === "in-person" ? "5" : "4"}</span>
              <div className="step-content">
                <strong>החזרת הציוד</strong>
                <p>ב-{formatDate(checkoutData.pickupReturn?.returnDate)} בשעה {checkoutData.pickupReturn?.returnTime || "19:00"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="important-reminders">
          <h3>⚠️ תזכורות חשובות</h3>
          <div className="reminders-list">
            <div className="reminder-item">
              <span className="reminder-icon">🕐</span>
              <p>הגע בזמן: שעות הפעילות 17:00-19:00 בלבד</p>
            </div>
            <div className="reminder-item">
              <span className="reminder-icon">💳</span>
              <p>הביא תעודת זהות תקפה המתאימה לפרטים שמילאת</p>
            </div>
            <div className="reminder-item">
              <span className="reminder-icon">💵</span>
              <p>תשלום במזומן בלבד - הכן את הסכום המדויק</p>
            </div>
            <div className="reminder-item">
              <span className="reminder-icon">📱</span>
              <p>שמור את פרטי ההזמנה (ניתן לראות בפרופיל)</p>
            </div>
          </div>
        </div>

        {isFirstTimeCustomer && (
          <div className="community-info">
            <h3>🤝 שולא השכרת ציוד</h3>
            <p>
              כלקוח חדש בשולא, אתה מוזמן ליצור קשר לקבלת ייעוץ מקצועי 
              וטיפים לשימוש בציוד. פרטי הקשר וההדרכה יינתנו לך בעת איסוף הציוד.
            </p>
          </div>
        )}
      </div>

      <div className="confirmation-actions">
        <button 
          className="btn-primary"
          onClick={onFinish}
        >
          סיום - חזור לפרופיל
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation; 