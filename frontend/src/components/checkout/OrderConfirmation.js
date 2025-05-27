import React, { useState, useEffect } from "react";
import "./OrderConfirmation.css";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

// Helper to get auth headers
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user.token || user.accessToken;
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  };
};

// Predefined pickup locations matching other components
const pickupLocations = [
  {
    id: "main_store",
    name: "החנות הראשית",
    address: "רחוב הרצל 123, תל אביב",
    description: "שעות פתיחה: א'-ה' 9:00-19:00, ו' 9:00-14:00"
  },
  {
    id: "north_branch", 
    name: "סניף צפון",
    address: "רחוב הגליל 45, חיפה",
    description: "שעות פתיחה: א'-ה' 8:00-18:00, ו' 8:00-13:00"
  },
  {
    id: "south_branch",
    name: "סניף דרום", 
    address: "שדרות בן גוריון 78, באר שבע",
    description: "שעות פתיחה: א'-ה' 9:00-18:00, ו' 9:00-13:00"
  },
  {
    id: "legacy_haifa",
    name: "סניף חיפה",
    address: "טבריה 15, חיפה",
    description: "שעות פתיחה: א'-ה' 9:00-19:00, ו' 9:00-14:00"
  }
];

// Enhanced address display logic with comprehensive fallbacks
const getAddressDisplay = (addressValue) => {
  if (!addressValue) {
    return "החנות הראשית - רחוב הרצל 123, תל אביב";
  }
  
  // First try to find by ID
  const locationById = pickupLocations.find(loc => loc.id === addressValue);
  if (locationById) {
    return `${locationById.name} - ${locationById.address}`;
  }
  
  // Try to find by address (for backward compatibility)
  const locationByAddress = pickupLocations.find(loc => loc.address === addressValue);
  if (locationByAddress) {
    return `${locationByAddress.name} - ${locationByAddress.address}`;
  }
  
  // If it's a string that might be a custom address, return it as-is
  if (typeof addressValue === 'string' && addressValue.length > 0) {
    return addressValue;
  }
  
  // Final fallback
  return "החנות הראשית - רחוב הרצל 123, תל אביב";
};

const OrderConfirmation = ({ 
  checkoutData, 
  cartItems, 
  total, 
  onFinish, 
  onPrev,
  onboardingChoice, 
  isFirstTimeCustomer,
  isFastCheckout,
  processOrder,
  calculateItemPrice
}) => {
  const [orderProcessed, setOrderProcessed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState("");

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

  const confettiConfig = {
    online: {
      title: "ההזמנה נוצרה בהצלחה!",
      subtitle: "הזמנתך התקבלה ועובדת",
      color: "#27ae60"
    },
    membership: {
      title: "ברוכים הבאים לקהילה!",
      subtitle: "הזמנתך אושרה והחברות שלך הופעלה",
      color: "#3498db"
    },
    general: {
      title: "ההזמנה אושרה!",
      subtitle: "פרטי ההזמנה נשלחו לאימייל שלך",
      color: "#8e44ad"
    }
  };

  const getSuccessMessage = () => {
    if (isFastCheckout || (checkoutData?.metadata?.onboardingChoice === "online")) {
      return confettiConfig.online;
    } else if (checkoutData?.metadata?.joinedCommunity) {
      return confettiConfig.membership;
    }
    return confettiConfig.general;
  };

  const successInfo = getSuccessMessage();

  // Modified: Remove automatic order processing for fast checkout - user should manually confirm
  useEffect(() => {
    // Only auto-process for regular checkout (non-fast checkout)
    // Fast checkout should require manual confirmation in Step 3
    if (!isFastCheckout) {
      const processOrderAutomatically = async () => {
        if (orderProcessed || processing) return;
        
        try {
          setProcessing(true);
          console.log('Processing order...');
          
          // Use the existing processOrder function from parent if available
          if (processOrder && typeof processOrder === 'function') {
            console.log('Using parent processOrder function');
            await processOrder(checkoutData, onboardingChoice);
          } else {
            console.log('Using local order processing');
            await processOrderDirectly();
          }
          
          setOrderProcessed(true);
          setProcessing(false);
          
        } catch (error) {
          console.error("Error in automatic order processing:", error.message);
          setProcessingError(
            error.response?.data?.message || 
            error.message ||
            "שגיאה ביצירת ההזמנה. אנא נסה שוב."
          );
          setProcessing(false);
        }
      };

      // Auto-process only for regular checkout
      if (checkoutData && cartItems.length > 0) {
        processOrderAutomatically();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFastCheckout, checkoutData, cartItems, orderProcessed, processing, onboardingChoice, processOrder, total]);

  // Handle fast checkout order processing
  const handleFastCheckoutOrderProcessing = async () => {
    try {
      setProcessing(true);
      
      // Use the existing processOrder function from parent if available
      if (processOrder && typeof processOrder === 'function') {
        console.log('Processing final order completion');
        // For fast checkout, we need to prevent the parent from changing steps
        await processOrder(checkoutData, onboardingChoice, true); // Pass true to indicate this is fast checkout completion
      } else {
        console.log('Using local order processing for completion');
        await processOrderDirectly();
      }
      
      setOrderProcessed(true);
      setProcessing(false);
      
    } catch (error) {
      console.error("Error in final order processing:", error.message);
      setProcessingError(
        error.response?.data?.message || 
        error.message ||
        "שגיאה ביצירת ההזמנה. אנא נסה שוב."
      );
      setProcessing(false);
    }
  };

  // Direct order processing with corrected payload structure
  const processOrderDirectly = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const orderData = {
      items: cartItems.map(item => ({
        product: item.product._id, // Corrected from item.productId
        rentalPeriod: item.rentalPeriod,
        price: calculateItemPrice ? calculateItemPrice(item) : item.price // Use calculateItemPrice if available
      })),
      totalValue: total,
      customerInfo: checkoutData?.customerInfo || {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        idNumber: ""
      },
      pickupReturn: checkoutData?.pickupReturn || {
        pickupDate: new Date().toISOString(),
        pickupTime: "17:00",
        pickupAddress: "main_store",
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        returnTime: "19:00",
        returnAddress: "main_store"
      },
      contract: checkoutData?.contract || {
        signed: false,
        signatureData: null,
        agreementVersion: "1.0",
        signedAt: null
      },
      idUpload: checkoutData?.idUpload || {
        uploaded: false,
        fileName: "",
        fileUrl: ""
      },
      payment: {
        method: "cash",
        cardData: null,
        paymentStatus: "pending"
      },
      metadata: {
        checkoutVersion: "2.0",
        completedAt: new Date().toISOString(),
        onboardingChoice: onboardingChoice || "online",
        isFirstTimeCustomer: isFirstTimeCustomer,
        isFastCheckout: isFastCheckout
      }
    };

    // console.log('Creating order...');

    const config = getAuthHeaders();
    const response = await axios.post(`${API_URL}/api/orders`, orderData, config);
    
    console.log('Order created successfully');
    return response.data;
  };

  // Show loading while processing
  if (processing) {
    return (
      <div className="order-confirmation-step">
        <div className="processing-container">
          <div className="processing-animation">
            <div className="spinner"></div>
          </div>
          <h2>
            <svg className="processing-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
            מעבד הזמנה...
          </h2>
          <p>אנא המתן, אנו מעבדים את ההזמנה שלך</p>
        </div>
      </div>
    );
  }

  // Show error if processing failed
  if (processingError) {
    return (
      <div className="order-confirmation-step">
        <div className="error-state">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </div>
          <h3>שגיאה בעיבוד ההזמנה</h3>
          <p>{processingError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // For fast checkout: Show manual confirmation step before processing
  if (isFastCheckout && !orderProcessed) {
    return (
      <div className="order-confirmation-step">
        <div className="final-confirmation-container">
          <div className="confirmation-header">
            <h2>
              <svg className="completion-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
              השלמת הזמנה
            </h2>
            <p>בדוק את פרטי ההזמנה ולחץ להשלמה</p>
          </div>

          <div className="final-order-summary">
            <h3>
              <svg className="summary-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              סיכום ההזמנה הסופי
            </h3>
            
            <div className="order-items-final">
              {cartItems.map((item, index) => (
                <div key={index} className="final-order-item">
                  <div className="item-image-small">
                    <img 
                      src={item.product.productImageUrl || "/placeholder.jpg"} 
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="item-details-final">
                    <h4>{item.product.name}</h4>
                    <p className="rental-dates">
                      {formatDate(item.rentalPeriod.startDate)} - {formatDate(item.rentalPeriod.endDate)}
                    </p>
                  </div>
                  <div className="item-price-final">
                    {formatPrice(calculateItemPrice ? calculateItemPrice(item) : item.price)}
                  </div>
                </div>
              ))}
            </div>

            {checkoutData?.pickupReturn && (
              <div className="pickup-return-final">
                <h4>
                  <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px'}}>
                    <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                  </svg>
                  פרטי איסוף והחזרה
                </h4>
                <div className="pickup-return-summary">
                  <div className="pickup-final">
                    <strong>איסוף:</strong> {formatDate(checkoutData.pickupReturn.pickupDate)} בשעה {checkoutData.pickupReturn.pickupTime}
                    <br />
                    <small>{getAddressDisplay(checkoutData.pickupReturn.pickupAddress)}</small>
                  </div>
                  <div className="return-final">
                    <strong>החזרה:</strong> {formatDate(checkoutData.pickupReturn.returnDate)} בשעה {checkoutData.pickupReturn.returnTime}
                    <br />
                    <small>{getAddressDisplay(checkoutData.pickupReturn.returnAddress)}</small>
                  </div>
                </div>
              </div>
            )}

            <div className="total-final">
              <div className="total-row-final grand-total">
                <span>סה"כ לתשלום במזומן:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="completion-notice">
            <div className="notice-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C11.2,10.5 10.5,9.8 10.5,9C10.5,8.2 11.2,7.5 12,7.5C12.8,7.5 13.5,8.2 13.5,9C13.5,9.8 12.8,10.5 12,10.5Z"/>
              </svg>
            </div>
            <div className="notice-text">
              <h4>מוכן להשלמה</h4>
              <p>כל הפרטים אושרו. לחץ על "השלם הזמנה" כדי לסיים את התהליך.</p>
            </div>
          </div>

          <div className="final-actions">
            <button 
              className="btn-primary complete-order-btn"
              onClick={handleFastCheckoutOrderProcessing}
              disabled={processing}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
              השלם הזמנה
            </button>
            
            <button 
              className="btn-secondary"
              onClick={onPrev || (() => window.history.back())}
              disabled={processing}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
              </svg>
              חזור לעריכה
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show success screen after order is processed
  return (
    <div className="order-confirmation-step">
      <div className="success-container">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
          </svg>
        </div>
        
        <div className="success-content">
          <h2>{successInfo.title}</h2>
          <p className="subtitle">{successInfo.subtitle}</p>
          
          {isFirstTimeCustomer && onboardingChoice === "online" && (
            <div className="welcome-section">
              <h3>
                <svg className="gift-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12H22M2,7H22V11H2V7M7,2A3,3 0 0,1 10,5H14A3,3 0 0,1 17,2A3,3 0 0,1 20,5H22A1,1 0 0,1 23,6A1,1 0 0,1 22,7H2A1,1 0 0,1 1,6A1,1 0 0,1 2,5H4A3,3 0 0,1 7,2M7,4A1,1 0 0,0 6,5H8A1,1 0 0,0 7,4M17,4A1,1 0 0,0 16,5H18A1,1 0 0,0 17,4Z"/>
                </svg>
                ברוכים הבאים לקהילה!
              </h3>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.8,10.9C9.53,10.31 8.8,9.7 8.8,8.75C8.8,7.66 9.81,6.9 11.5,6.9C13.28,6.9 13.94,7.75 14,9H16.21C16.14,7.28 15.09,5.7 13,5.19V3H10V5.16C8.06,5.58 6.5,6.84 6.5,8.77C6.5,11.08 8.41,12.23 11.2,12.9C13.7,13.5 14.2,14.38 14.2,15.31C14.2,16 13.71,17.1 11.5,17.1C9.44,17.1 8.63,16.18 8.5,15H6.32C6.44,17.19 8.08,18.42 10,18.83V21H13V18.85C14.95,18.5 16.5,17.35 16.5,15.3C16.5,12.46 14.07,11.5 11.8,10.9Z"/>
                    </svg>
                  </span>
                  <span>מחירים מיוחדים לחברי קהילה</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
                    </svg>
                  </span>
                  <span>תהליך הזמנה מהיר וקל</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="order-summary">
            <h3>
              <svg className="clipboard-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M12,8L16,12H13V16H11V12H8L12,8Z"/>
              </svg>
              סיכום ההזמנה
            </h3>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>מספר הזמנה:</span>
                <span className="order-number">#{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
              </div>
              
              <div className="items-list">
                {cartItems.map((item, index) => (
                  <div key={index} className="item-row">
                    <span className="item-name">{item.product.name}</span>
                    <span className="item-period">
                      {formatDate(item.rentalPeriod.startDate)} - 
                      {formatDate(item.rentalPeriod.endDate)}
                    </span>
                    <span className="item-price">₪{calculateItemPrice ? calculateItemPrice(item) : item.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="total-section">
                <div className="summary-row total">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="next-steps">
            <h3>
              <svg className="checklist-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              השלבים הבאים
            </h3>
            
            {checkoutData.pickupReturn && (
              <div className="steps-container">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>אישור ההזמנה</h4>
                    <p>תקבל אישור ופרטי איסוף באימייל תוך דקות ספורות</p>
                  </div>
                </div>
                
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>איסוף הציוד</h4>
                    <p>
                      {formatDate(checkoutData.pickupReturn.pickupDate)} ב-{checkoutData.pickupReturn.pickupTime}
                      <br />
                      <small>{getAddressDisplay(checkoutData.pickupReturn.pickupAddress)}</small>
                    </p>
                  </div>
                </div>
                
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>החזרת הציוד</h4>
                    <p>
                      {formatDate(checkoutData.pickupReturn.returnDate)} ב-{checkoutData.pickupReturn.returnTime}
                      <br />
                      <small>{getAddressDisplay(checkoutData.pickupReturn.returnAddress)}</small>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="important-reminders">
            <h3>
              <svg className="warning-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              תזכורות חשובות
            </h3>
            
            <div className="reminders-list">
              {onboardingChoice === "in-person" && (
                <div className="reminder-item">
                  <span className="reminder-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                    </svg>
                  </span>
                  <span>הבא תעודת זהות בתוקף לאימות בעת איסוף הציוד</span>
                </div>
              )}
              
              <div className="reminder-item">
                <span className="reminder-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
                  </svg>
                </span>
                <span>הישאר זמין בטלפון לתיאום מדויק של זמני איסוף והחזרה</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button 
          className="btn-primary"
          onClick={onFinish}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
          לפרופיל שלי
        </button>
        
        <button 
          className="btn-secondary"
          onClick={() => window.location.href = '/'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
          </svg>
          לעמוד הבית
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation; 