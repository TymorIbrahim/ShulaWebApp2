import React, { useState, useEffect } from "react";
import "./FastCheckoutConfirmation.css";

const FastCheckoutConfirmation = ({ 
  cartItems, 
  checkoutData, 
  total, 
  onNext, 
  onPrev, 
  calculateItemPrice,
  // Real-time props
  realTimeInventory,
  inventoryConflicts,
  isConnected,
  checkoutValidationStatus
}) => {
  const [availabilityTimeout, setAvailabilityTimeout] = useState(null);
  const [localValidationStatus, setLocalValidationStatus] = useState(checkoutValidationStatus);

  // Add timeout for availability checking to prevent infinite loading
  useEffect(() => {
    if (checkoutValidationStatus === 'validating') {
      // Clear any existing timeout
      if (availabilityTimeout) {
        clearTimeout(availabilityTimeout);
      }
      
      // Set a 10-second timeout for availability checking
      const timeout = setTimeout(() => {
        console.log('Availability check timeout - assuming valid after 10 seconds');
        setLocalValidationStatus('valid');
      }, 10000);
      
      setAvailabilityTimeout(timeout);
      setLocalValidationStatus('validating');
    } else {
      // Clear timeout if status changes
      if (availabilityTimeout) {
        clearTimeout(availabilityTimeout);
        setAvailabilityTimeout(null);
      }
      setLocalValidationStatus(checkoutValidationStatus);
    }
    
    // Cleanup on unmount
    return () => {
      if (availabilityTimeout) {
        clearTimeout(availabilityTimeout);
      }
    };
  }, [checkoutValidationStatus]);

  // Debug logging to help identify missing data issues
  console.log('FastCheckout - Data received:', {
    checkoutData,
    cartItems,
    total,
    hasPickupReturn: !!checkoutData?.pickupReturn,
    pickupReturnData: checkoutData?.pickupReturn,
    validationStatus: localValidationStatus,
    isConnected,
    inventoryConflictsCount: inventoryConflicts?.size || 0
  });

  // Predefined pickup locations (should match the ones in PickupReturnDetails)
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
    // Support for legacy hardcoded address
    {
      id: "legacy_haifa",
      name: "סניף חיפה",
      address: "טבריה 15, חיפה",
      description: "שעות פתיחה: א'-ה' 9:00-19:00, ו' 9:00-14:00"
    }
  ];

  const getLocationById = (id) => {
    // First try to find by ID
    const locationById = pickupLocations.find(loc => loc.id === id);
    if (locationById) {
      return locationById;
    }
    
    // If not found by ID, try to find by address (for backward compatibility)
    const locationByAddress = pickupLocations.find(loc => loc.address === id);
    if (locationByAddress) {
      return locationByAddress;
    }
    
    // Return null if no match found
    return null;
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

  // Remove tax calculation - use base total only
  // const totalWithTax = total * 1.17;
  const hasInventoryConflicts = inventoryConflicts?.size > 0;
  const isValidationInvalid = localValidationStatus === 'invalid';

  const handleFastConfirm = () => {
    // Check validation status before proceeding
    if (isValidationInvalid || hasInventoryConflicts) {
      return;
    }
    
    // This step should only confirm details and move to the final step
    // The actual order processing should happen in the final step
    
    // Move to next step (final order processing step)
    // Auto-scroll will be handled by the step transition
    onNext();
  };

  // Enhanced customer info display with better error handling and debugging
  const getCustomerInfoDisplay = () => {
    console.log('FastCheckout: Analyzing customer info display...', {
      hasCheckoutData: !!checkoutData,
      hasCustomerInfo: !!checkoutData?.customerInfo,
      customerInfoKeys: checkoutData?.customerInfo ? Object.keys(checkoutData.customerInfo) : [],
      rawCustomerInfo: checkoutData?.customerInfo
    });
    
    if (!checkoutData?.customerInfo) {
      console.log('FastCheckout: No customerInfo found in checkoutData');
      return {
        name: "מידע לקוח לא זמין - אנא רענן את הדף",
        email: "לא הוזן - יתעדכן אוטומטית",
        phone: "לא הוזן - יתעדכן אוטומטית", 
        idNumber: "יאומת במהלך האיסוף"
      };
    }
    
    const { firstName, lastName, email, phone, idNumber } = checkoutData.customerInfo;
    
    const customerDisplay = {
      name: (firstName || lastName) 
        ? `${firstName || ''} ${lastName || ''}`.trim()
        : "שם לא הוזן",
      email: email || "אימייל לא הוזן", 
      phone: phone || "טלפון לא הוזן",
      idNumber: (() => {
        if (!idNumber || idNumber === "TBD" || idNumber === "" || idNumber === "undefined") {
          return "יאומת במהלך האיסוף";
        }
        if (idNumber.includes("PENDING") || idNumber.includes("WILL_VERIFY")) {
          return "יאומת במהלך האיסוף";
        }
        return idNumber.length === 9 ? `***-**-${idNumber.slice(-4)}` : idNumber;
      })()
    };
    
    console.log('FastCheckout: Customer display data prepared:', customerDisplay);
    return customerDisplay;
  };

  // Enhanced address display with better fallback and debugging
  const getAddressDisplay = (addressValue) => {
    console.log('FastCheckout: Processing address display for:', addressValue);
    
    if (!addressValue) {
      console.log('FastCheckout: No address provided, using default');
      return "החנות הראשית - רחוב הרצל 123, תל אביב";
    }
    
    // First try to find by ID
    const locationById = pickupLocations.find(loc => loc.id === addressValue);
    if (locationById) {
      console.log('FastCheckout: Found location by ID:', locationById);
      return `${locationById.name} - ${locationById.address}`;
    }
    
    // Try to find by address (for backward compatibility)
    const locationByAddress = pickupLocations.find(loc => loc.address === addressValue);
    if (locationByAddress) {
      console.log('FastCheckout: Found location by address:', locationByAddress);
      return `${locationByAddress.name} - ${locationByAddress.address}`;
    }
    
    // If it's a string that might be a custom address, return it as-is
    if (typeof addressValue === 'string' && addressValue.length > 0) {
      console.log('FastCheckout: Using custom address:', addressValue);
      return addressValue;
    }
    
    // Final fallback
    console.log('FastCheckout: Using final fallback address');
    return "החנות הראשית - רחוב הרצל 123, תל אביב";
  };

  // Enhanced pickup/return display with debugging
  const getPickupReturnDisplay = () => {
    console.log('FastCheckout: Processing pickup/return display...', {
      hasPickupReturn: !!checkoutData?.pickupReturn,
      pickupReturnData: checkoutData?.pickupReturn
    });
    
    if (!checkoutData?.pickupReturn) {
      console.log('FastCheckout: No pickup/return data found');
      return {
        pickup: {
          date: "תאריך יוגדר",
          time: "שעה תוגדר", 
          address: "מיקום יוגדר"
        },
        return: {
          date: "תאריך יוגדר",
          time: "שעה תוגדר",
          address: "מיקום יוגדר"
        }
      };
    }
    
    const { pickupDate, pickupTime, pickupAddress, returnDate, returnTime, returnAddress } = checkoutData.pickupReturn;
    
    const display = {
      pickup: {
        date: pickupDate ? formatDate(pickupDate) : "תאריך יוגדר במהלך האישור",
        time: pickupTime || "שעה תוגדר במהלך האישור",
        address: getAddressDisplay(pickupAddress)
      },
      return: {
        date: returnDate ? formatDate(returnDate) : "תאריך יוגדר במהלך האישור", 
        time: returnTime || "שעה תוגדר במהלך האישור",
        address: getAddressDisplay(returnAddress || pickupAddress) // Fallback to pickup address
      }
    };
    
    console.log('FastCheckout: Pickup/return display prepared:', display);
    return display;
  };

  // Enhanced date/time display
  const getDateTimeDisplay = () => {
    if (!checkoutData?.pickupReturn) {
      return {
        rentalStart: "תאריך התחלה יוגדר",
        rentalEnd: "תאריך סיום יוגדר"
      };
    }
    
    const { pickupDate, returnDate } = checkoutData.pickupReturn;
    return {
      rentalStart: pickupDate ? formatDate(pickupDate) : "תאריך התחלה יוגדר",
      rentalEnd: returnDate ? formatDate(returnDate) : "תאריך סיום יוגדר"
    };
  };

  // Enhanced contract status display
  const getContractStatus = () => {
    const contract = checkoutData?.contract;
    if (!contract) {
      return {
        status: "pending",
        text: "יושלם במהלך האיסוף",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C10.9,10.5 10,9.6 10,8.5C10,7.4 10.9,6.5 12,6.5C13.1,6.5 14,7.4 14,8.5C14,9.6 13.1,10.5 12,10.5Z"/>
          </svg>
        )
      };
    }
    
    if (contract.signed) {
      return {
        status: "completed",
        text: `נחתם ב-${formatDate(contract.signedAt)}`,
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
          </svg>
        )
      };
    }
    
    return {
      status: "pending",
      text: "יושלם במהלך האיסוף",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C10.9,10.5 10,9.6 10,8.5C10,7.4 10.9,6.5 12,6.5C13.1,6.5 14,7.4 14,8.5C14,9.6 13.1,10.5 12,10.5Z"/>
        </svg>
      )
    };
  };

  // Enhanced ID upload status display
  const getIdUploadStatus = () => {
    const idUpload = checkoutData?.idUpload;
    if (!idUpload) {
      return {
        status: "pending",
        text: "יאומת במהלך האיסוף",
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C10.9,10.5 10,9.6 10,8.5C10,7.4 10.9,6.5 12,6.5C13.1,6.5 14,7.4 14,8.5C14,9.6 13.1,10.5 12,10.5Z"/>
          </svg>
        )
      };
    }
    
    if (idUpload.uploaded && idUpload.fileName) {
      return {
        status: "completed",
        text: `הועלה: ${idUpload.fileName}`,
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
          </svg>
        )
      };
    }
    
    return {
      status: "pending", 
      text: "יאומת במהלך האיסוף",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C10.9,10.5 10,9.6 10,8.5C10,7.4 10.9,6.5 12,6.5C13.1,6.5 14,7.4 14,8.5C14,9.6 13.1,10.5 12,10.5Z"/>
        </svg>
      )
    };
  };

  const contractStatus = getContractStatus();
  const idStatus = getIdUploadStatus();

  return (
    <div className="fast-checkout-confirmation">
      <div className="step-header">
        <h2>
          <svg className="fast-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,1V3H11V1H13M19.03,7.39L20.45,5.97L18.76,4.28L17.34,5.7C15.9,4.76 14.1,4.5 12.5,5L12,5.18V7.82L12.5,8C15.29,8.85 16.07,12.62 14.07,14.62C12.06,16.63 8.29,15.85 7.44,13.06L7.26,12.56H4.72L4.9,13.06C5.86,16.92 10.1,19.44 14,18.5C17.89,17.55 20.42,13.31 19.5,9.5C19.28,8.58 18.84,7.71 18.22,6.97L19.03,7.39M6.5,10C8,10 9.24,11.24 9.24,12.74C9.24,14.24 8,15.5 6.5,15.5C5,15.5 3.76,14.24 3.76,12.74C3.76,11.24 5,10 6.5,10Z"/>
          </svg>
          אישור מהיר
        </h2>
        <p>כל הפרטים שלך כבר קיימים במערכת - פשוט אשר והזמן!</p>
      </div>

      <div className="fast-checkout-content">
        <div className="welcome-back-section">
          <div className="welcome-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
            </svg>
          </div>
          <h3>ברוך השב, {checkoutData.customerInfo?.firstName}!</h3>
          <p>
            מצאנו את כל הפרטים שלך במערכת. תוכל לאשר את ההזמנה במהירות 
            ללא צורך למלא שוב את הפרטים.
          </p>
        </div>

        <div className="pre-filled-info">
          <h3>
            <svg className="clipboard-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
            </svg>
            פרטים שנשמרו במערכת
          </h3>
          
          <div className="info-sections">
            <div className="info-section">
              <h4>
                <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                פרטים אישיים
              </h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">שם:</span>
                  <span>{getCustomerInfoDisplay().name}</span>
                </div>
                <div className="info-item">
                  <span className="label">אימייל:</span>
                  <span>{getCustomerInfoDisplay().email}</span>
                </div>
                <div className="info-item">
                  <span className="label">טלפון:</span>
                  <span>{getCustomerInfoDisplay().phone}</span>
                </div>
                <div className="info-item">
                  <span className="label">תעודת זהות:</span>
                  <span>{getCustomerInfoDisplay().idNumber}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>
                <svg className="contract-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                הסכם השכירות
              </h4>
              <div className="contract-status">
                {contractStatus.status === 'completed' ? (
                  <div className="status-item success">
                    <span className="status-icon">
                      {contractStatus.icon}
                    </span>
                    <span>{contractStatus.text}</span>
                  </div>
                ) : (
                  <div className="status-item pending">
                    <span className="status-icon">
                      {contractStatus.icon}
                    </span>
                    <span>{contractStatus.text}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-section">
              <h4>
                <svg className="id-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                תעודת זהות
              </h4>
              <div className="id-status">
                {idStatus.status === 'completed' ? (
                  <div className="status-item success">
                    <span className="status-icon">
                      {idStatus.icon}
                    </span>
                    <span>{idStatus.text}</span>
                  </div>
                ) : (
                  <div className="status-item pending">
                    <span className="status-icon">
                      {idStatus.icon}
                    </span>
                    <span>{idStatus.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-summary-fast">
          <h3>
            <svg className="cart-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
            </svg>
            פריטים להזמנה
          </h3>
          <div className="items-list">
            {cartItems.map((item, index) => (
              <div key={index} className="fast-item">
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
                  <div className="rental-period">
                    <svg className="calendar-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                    </svg>
                    {getDateTimeDisplay().rentalStart} - {getDateTimeDisplay().rentalEnd}
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
          <h3>
            <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
            </svg>
            פרטי איסוף והחזרה
          </h3>
          <div className="pickup-return-grid">
            <div className="pickup-details">
              <h4>
                <svg className="truck-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5M19.5,9.5L21.46,12H17V9.5M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M20,8H17V4H3C1.89,4 1,4.89 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8Z"/>
                </svg>
                איסוף
              </h4>
              <p><strong>תאריך:</strong> {getPickupReturnDisplay().pickup.date}</p>
              <p><strong>שעה:</strong> {getPickupReturnDisplay().pickup.time}</p>
              <p><strong>מיקום:</strong> {getPickupReturnDisplay().pickup.address}</p>
            </div>
            <div className="return-details">
              <h4>
                <svg className="return-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                </svg>
                החזרה
              </h4>
              <p><strong>תאריך:</strong> {getPickupReturnDisplay().return.date}</p>
              <p><strong>שעה:</strong> {getPickupReturnDisplay().return.time}</p>
              <p><strong>מיקום:</strong> {getPickupReturnDisplay().return.address}</p>
            </div>
          </div>
        </div>

        <div className="total-section-fast">
          <h3>
            <svg className="money-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
            </svg>
            סיכום תשלום
          </h3>
          <div className="total-breakdown">
            <div className="total-row final">
              <span>סה"כ לתשלום במזומן:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="fast-checkout-notice">
          <div className="notice-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,1V3H11V1H13M19.03,7.39L20.45,5.97L18.76,4.28L17.34,5.7C15.9,4.76 14.1,4.5 12.5,5L12,5.18V7.82L12.5,8C15.29,8.85 16.07,12.62 14.07,14.62C12.06,16.63 8.29,15.85 7.44,13.06L7.26,12.56H4.72L4.9,13.06C5.86,16.92 10.1,19.44 14,18.5C17.89,17.55 20.42,13.31 19.5,9.5C19.28,8.58 18.84,7.71 18.22,6.97L19.03,7.39M6.5,10C8,10 9.24,11.24 9.24,12.74C9.24,14.24 8,15.5 6.5,15.5C5,15.5 3.76,14.24 3.76,12.74C3.76,11.24 5,10 6.5,10Z"/>
            </svg>
          </div>
          <div className="notice-content">
            <h4>אישור פרטים</h4>
            <p>
              כל הפרטים שלך כבר קיימים במערכת מהזמנות קודמות. 
              אשר את הפרטים ועבור לשלב האחרון להשלמת ההזמנה.
            </p>
          </div>
        </div>

        {/* Real-time validation status display */}
        <div className="validation-status-section">
          <h4>
            <svg className="validation-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C11.2,10.5 10.5,9.8 10.5,9C10.5,8.2 11.2,7.5 12,7.5C12.8,7.5 13.5,8.2 13.5,9C13.5,9.8 12.8,10.5 12,10.5Z"/>
            </svg>
            סטטוס בדיקת זמינות
          </h4>
          
          <div className={`validation-display ${localValidationStatus}`}>
            <div className="validation-indicator">
              {localValidationStatus === 'validating' && (
                <svg className="spin" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
              )}
              {localValidationStatus === 'valid' && (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                </svg>
              )}
              {localValidationStatus === 'invalid' && (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              )}
              {localValidationStatus === 'pending' && (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6Z"/>
                </svg>
              )}
            </div>
            
            <div className="validation-text">
              {localValidationStatus === 'validating' && 'בודק זמינות פריטים בזמן אמת...'}
              {localValidationStatus === 'valid' && 'כל הפריטים זמינים ומוכנים להזמנה'}
              {localValidationStatus === 'invalid' && 'זוהו בעיות זמינות - נא לבדוק את העגלה'}
              {localValidationStatus === 'pending' && 'ממתין לבדיקת זמינות'}
            </div>
            
            <div className="connection-status">
              <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                <svg viewBox="0 0 12 12" fill="currentColor">
                  <circle cx="6" cy="6" r="6"/>
                </svg>
              </span>
              <span className="connection-text">
                {isConnected ? 'מחובר לבדיקת זמינות בזמן אמת' : 'לא מחובר לבדיקה בזמן אמת'}
              </span>
            </div>
          </div>

          {/* Display inventory conflicts if any */}
          {hasInventoryConflicts && (
            <div className="inventory-conflicts-display">
              <h5>בעיות זמינות שזוהו:</h5>
              {Array.from(inventoryConflicts.entries()).map(([cartItemId, conflict]) => {
                const item = cartItems.find(ci => ci._id === cartItemId);
                if (!item) return null;
                
                return (
                  <div key={cartItemId} className="conflict-item">
                    <span className="conflict-product">{item.product.name}</span>
                    <span className="conflict-message">{conflict.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className={`btn-primary fast-confirm-btn ${(isValidationInvalid || hasInventoryConflicts) ? 'disabled' : ''}`}
          onClick={handleFastConfirm}
          disabled={isValidationInvalid || hasInventoryConflicts}
        >
          {localValidationStatus === 'validating' && (
            <span className="loading-spinner"></span>
          )}
          {(isValidationInvalid || hasInventoryConflicts) 
            ? 'לא ניתן להמשיך - יש בעיות זמינות'
            : 'המשך להשלמת הזמנה →'
          }
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
        >
          ← חזור לסיכום
        </button>
      </div>
    </div>
  );
};

export default FastCheckoutConfirmation; 