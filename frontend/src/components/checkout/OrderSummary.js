import React, { useState, useEffect } from "react";
import "./OrderSummary.css";

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

const OrderSummary = ({ 
  cartItems, 
  total, 
  onNext, 
  calculateItemPrice, 
  pickupReturn, 
  isFastCheckout = false,
  onboardingChoice,
  processInPersonOrder,
  // Real-time props
  realTimeInventory,
  inventoryConflicts,
  isConnected,
  checkoutValidationStatus
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [availabilityTimeout, setAvailabilityTimeout] = useState(false);

  // Add timeout for availability checking to prevent infinite spinning
  useEffect(() => {
    const timer = setTimeout(() => {
      setAvailabilityTimeout(true);
    }, 5000); // 5 second timeout for availability checking

    return () => clearTimeout(timer);
  }, []);

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

  const getAvailabilityStatus = (item, realTimeInventory) => {
    const productId = item.product._id;
    const realTimeData = realTimeInventory?.get(productId);
    
    // If we have real-time data, use it
    if (realTimeData) {
      const availableUnits = realTimeData.availableNow || 0;
      const totalUnits = realTimeData.totalUnits || 0;
      
      if (availableUnits === 0) {
        return {
          status: 'unavailable',
          message: 'לא זמין כרגע',
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          ),
          color: '#dc2626'
        };
      } else if (availableUnits <= 2) {
        return {
          status: 'low',
          message: `נותרו ${availableUnits} יחידות`,
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
          ),
          color: '#f59e0b'
        };
      } else {
        return {
          status: 'available',
          message: `זמין (${availableUnits} יחידות)`,
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
          ),
          color: '#059669'
        };
      }
    }
    
    // If availability check has timed out or we're not connected, show fallback
    if (availabilityTimeout || !isConnected) {
      const totalUnits = item.product.inventory?.totalUnits || 0;
      return {
        status: totalUnits > 0 ? 'available' : 'unavailable',
        message: totalUnits > 0 ? `זמין` : 'לא זמין',
        icon: totalUnits > 0 ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        ),
        color: totalUnits > 0 ? '#059669' : '#dc2626'
      };
    }
    
    // Still checking - only show for first 5 seconds
    return {
      status: 'checking',
      message: 'בודק זמינות...',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" className="spin"/>
        </svg>
      ),
      color: '#6b7280'
    };
  };

  // Remove tax calculation - use base total only
  // const totalWithTax = total * 1.17;
  const hasInventoryConflicts = inventoryConflicts?.size > 0;
  const isValidationInvalid = checkoutValidationStatus === 'invalid';

  return (
    <div className="order-summary-step">
      <div className="step-header">
        <h2>
          <svg className="summary-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
          </svg>
          סיכום הזמנה
        </h2>

        {/* Compact Validation Status Indicator */}
        <div className={`checkout-validation-status compact ${checkoutValidationStatus}`}>
          <span className="validation-icon">
            {checkoutValidationStatus === 'validating' && (
              <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
              </svg>
            )}
            {checkoutValidationStatus === 'valid' && (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
            )}
            {checkoutValidationStatus === 'invalid' && (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            )}
            {checkoutValidationStatus === 'pending' && (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6Z"/>
              </svg>
            )}
          </span>
          <span className="validation-text">
            {checkoutValidationStatus === 'validating' && 'בודק זמינות...'}
            {checkoutValidationStatus === 'valid' && 'כל הפריטים זמינים'}
            {checkoutValidationStatus === 'invalid' && 'בעיות זמינות זוהו'}
            {checkoutValidationStatus === 'pending' && 'ממתין לבדיקת זמינות'}
          </span>
        </div>

        {/* Compact Inventory Issues Alert */}
        {inventoryConflicts.size > 0 && (
          <div className="availability-issues-alert compact">
            <h4>
              <svg className="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              בעיות זמינות - אנא עדכן את העגלה
            </h4>
          </div>
        )}
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      <div className="order-items">
        <h3>
          <svg className="cart-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
          </svg>
          פריטים בהזמנה
        </h3>
        <div className="items-grid">
          {cartItems.map((item, index) => {
            const availabilityStatus = getAvailabilityStatus(item, realTimeInventory);
            
            return (
              <div key={index} className={`order-item compact ${availabilityStatus.status}`}>
                <div className="item-image">
                  <img 
                    src={item.product.productImageUrl || "/placeholder.jpg"}
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  {item.quantity > 1 && (
                    <p className="item-quantity">כמות: {item.quantity} יחידות</p>
                  )}
                  <p className="item-period">
                    <svg className="calendar-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                    </svg>
                    {formatDate(item.rentalPeriod.startDate)} - {formatDate(item.rentalPeriod.endDate)}
                  </p>
                  
                  {/* Compact Real-time availability status */}
                  <div className={`availability-status compact ${availabilityStatus.status}`}>
                    <span className="status-icon">{availabilityStatus.icon}</span>
                    <span className="status-text">{availabilityStatus.message}</span>
                    {isConnected && !availabilityTimeout && (
                      <span className="live-indicator">
                        <svg className="pulse" viewBox="0 0 12 12" fill="currentColor">
                          <circle cx="6" cy="6" r="6"/>
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <div className="item-price">
                  <span className="price-amount">₪{calculateItemPrice(item)}</span>
                  <span className="price-period">לתקופה</span>
                  {item.quantity > 1 && (
                    <span className="price-per-unit">(₪{(calculateItemPrice(item) / item.quantity).toFixed(2)} ליחידה)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pickupReturn && (
        <div className="pickup-return-info">
          <h4>
            <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
            איסוף והחזרה
          </h4>
          <div className="pickup-return-details">
            <div className="pickup-detail">
              <strong>איסוף:</strong> 
              <div className="detail-info">
                <span className="date-time">{formatDate(pickupReturn.pickupDate)} בשעה {pickupReturn.pickupTime}</span>
                <span className="location">{getAddressDisplay(pickupReturn.pickupAddress)}</span>
              </div>
            </div>
            <div className="return-detail">
              <strong>החזרה:</strong> 
              <div className="detail-info">
                <span className="date-time">{formatDate(pickupReturn.returnDate)} בשעה {pickupReturn.returnTime}</span>
                <span className="location">{getAddressDisplay(pickupReturn.returnAddress)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pricing-summary">
        <h3>
          <svg className="money-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
          </svg>
          סיכום מחירים
        </h3>
        <div className="pricing-details">
          <div className="price-row total-row">
            <span>סה"כ לתשלום:</span>
            <span>₪{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="order-actions">
        {isFastCheckout ? (
          <button
            className="btn-primary checkout-btn"
            onClick={onNext}
            disabled={checkoutValidationStatus === 'invalid' || inventoryConflicts.size > 0}
          >
            המשך לאישור הזמנה
          </button>
        ) : onboardingChoice === "in-person" ? (
          <button
            className="btn-primary checkout-btn"
            onClick={processInPersonOrder}
            disabled={checkoutValidationStatus === 'invalid' || inventoryConflicts.size > 0}
          >
            השלם הזמנה להשלמה אישית
          </button>
        ) : (
          <button
            className="btn-primary checkout-btn"
            onClick={onNext}
            disabled={checkoutValidationStatus === 'invalid' || inventoryConflicts.size > 0}
          >
            המשך למילוי פרטים
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderSummary; 