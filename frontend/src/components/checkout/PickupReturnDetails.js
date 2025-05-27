import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./PickupReturnDetails.css";

const PickupReturnDetails = ({ data, cartItems, onUpdate, onNext, onPrev, canProceed }) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Predefined pickup locations
  const pickupLocations = [
    {
      id: "main_store",
      name: "החנות הראשית",
      address: "רחוב הרצל 123, תל אביב",
      description: "שעות פתיחה: א'-ה' 9:00-19:00, ו' 9:00-14:00",
      coordinates: { lat: 32.0853, lng: 34.7818 }
    },
    {
      id: "north_branch",
      name: "סניף צפון",
      address: "רחוב הגליל 45, חיפה",
      description: "שעות פתיחה: א'-ה' 8:00-18:00, ו' 8:00-13:00",
      coordinates: { lat: 32.7940, lng: 34.9896 }
    },
    {
      id: "south_branch",
      name: "סניף דרום",
      address: "שדרות בן גוריון 78, באר שבע",
      description: "שעות פתיחה: א'-ה' 9:00-18:00, ו' 9:00-13:00",
      coordinates: { lat: 31.2530, lng: 34.7915 }
    }
  ];

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  useEffect(() => {
    setFormData(data);
  }, [data]);

  // Get earliest and latest dates from cart items
  const getDateLimits = () => {
    if (!cartItems || cartItems.length === 0) return { earliest: new Date(), latest: new Date() };
    
    const startDates = cartItems.map(item => new Date(item.rentalPeriod.startDate));
    const endDates = cartItems.map(item => new Date(item.rentalPeriod.endDate));
    
    const earliest = new Date(Math.min(...startDates));
    const latest = new Date(Math.max(...endDates));
    
    return { earliest, latest };
  };

  const { earliest: earliestDate, latest: latestDate } = getDateLimits();

  const validateField = (name, value) => {
    switch (name) {
      case 'pickupAddress':
        return !value ? 'יש לבחור מיקום איסוף' : '';
      case 'pickupDate':
        if (!value) return 'יש לבחור תאריך איסוף';
        const pickupDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (pickupDate < today) return 'תאריך איסוף לא יכול להיות בעבר';
        if (pickupDate > earliestDate) return 'תאריך איסוף חייב להיות לפני תחילת השכירות';
        return '';
      case 'pickupTime':
        return !value ? 'יש לבחור שעת איסוף' : '';
      case 'returnAddress':
        return !value ? 'יש לבחור מיקום החזרה' : '';
      case 'returnDate':
        if (!value) return 'יש לבחור תאריך החזרה';
        const returnDate = new Date(value);
        if (returnDate < latestDate) return 'תאריך החזרה חייב להיות אחרי סיום השכירות';
        return '';
      case 'returnTime':
        return !value ? 'יש לבחור שעת החזרה' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    onUpdate({ [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    const fieldsToValidate = ['pickupAddress', 'pickupDate', 'pickupTime', 'returnAddress', 'returnDate', 'returnTime'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      pickupAddress: true,
      pickupDate: true,
      pickupTime: true,
      returnAddress: true,
      returnDate: true,
      returnTime: true
    });
    
    if (Object.keys(newErrors).length === 0 && canProceed) {
      onNext();
    }
  };

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL');
  };

  // Allow only Sunday, Tuesday, Thursday for pickup/return
  const filterDates = (date) => {
    const day = date.getDay();
    return day === 0 || day === 2 || day === 4;
  };

  const getLocationById = (id) => {
    return pickupLocations.find(loc => loc.id === id);
  };

  return (
    <div className="pickup-return-step">
      <div className="step-header">
        <h2>
          <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
          </svg>
          פרטי איסוף והחזרה
        </h2>
        <p>בחר מיקומים ותאריכים לאיסוף והחזרת הפריטים</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="pickup-return-form">
          
          {/* Rental Period Display */}
          <div className="rental-period-display">
            <h3>תקופת השכירות</h3>
            <div className="period-info">
              <span>מ: {formatDateForDisplay(earliestDate)}</span>
              <span>עד: {formatDateForDisplay(latestDate)}</span>
            </div>
          </div>

          <div className="form-sections">
            {/* Pickup Section */}
            <div className="form-section pickup-section">
              <h3>
                <svg className="truck-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5M19.5,9.5L21.46,12H17V9.5M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M20,8H17V4H3C1.89,4 1,4.89 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8Z"/>
                </svg>
                איסוף
              </h3>
              
              <div className="form-group">
                <label htmlFor="pickupAddress">
                  מיקום איסוף *
                  <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                  </svg>
                </label>
                <select
                  id="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                  onBlur={(e) => handleBlur('pickupAddress', e.target.value)}
                  className={errors.pickupAddress ? 'error' : ''}
                  required
                >
                  <option value="">בחר מיקום איסוף</option>
                  {pickupLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
                {errors.pickupAddress && touched.pickupAddress && (
                  <span className="error-message">{errors.pickupAddress}</span>
                )}
                
                {formData.pickupAddress && (
                  <div className="location-details">
                    <div className="location-info">
                      <h4>{getLocationById(formData.pickupAddress)?.name}</h4>
                      <p>{getLocationById(formData.pickupAddress)?.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="date-time-row">
                <div className="form-group">
                  <label>
                    תאריך איסוף *
                    <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                    </svg>
                  </label>
                  <DatePicker
                    selected={formData.pickupDate}
                    onChange={(date) => handleInputChange('pickupDate', date)}
                    onBlur={() => handleBlur('pickupDate', formData.pickupDate)}
                    filterDate={filterDates}
                    minDate={new Date()}
                    maxDate={earliestDate}
                    placeholderText="בחר תאריך"
                    className={errors.pickupDate ? 'error' : ''}
                    dateFormat="dd/MM/yyyy"
                  />
                  {errors.pickupDate && touched.pickupDate && (
                    <span className="error-message">{errors.pickupDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="pickupTime">
                    שעת איסוף *
                    <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                  </label>
                  <select
                    id="pickupTime"
                    value={formData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    onBlur={(e) => handleBlur('pickupTime', e.target.value)}
                    className={errors.pickupTime ? 'error' : ''}
                    required
                  >
                    <option value="">בחר שעה</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.pickupTime && touched.pickupTime && (
                    <span className="error-message">{errors.pickupTime}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Return Section */}
            <div className="form-section return-section">
              <h3>
                <svg className="return-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                </svg>
                החזרה
              </h3>
              
              <div className="form-group">
                <label htmlFor="returnAddress">
                  מיקום החזרה *
                  <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                  </svg>
                </label>
                <select
                  id="returnAddress"
                  value={formData.returnAddress}
                  onChange={(e) => handleInputChange('returnAddress', e.target.value)}
                  onBlur={(e) => handleBlur('returnAddress', e.target.value)}
                  className={errors.returnAddress ? 'error' : ''}
                  required
                >
                  <option value="">בחר מיקום החזרה</option>
                  {pickupLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </option>
                  ))}
                </select>
                {errors.returnAddress && touched.returnAddress && (
                  <span className="error-message">{errors.returnAddress}</span>
                )}
                
                {formData.returnAddress && (
                  <div className="location-details">
                    <div className="location-info">
                      <h4>{getLocationById(formData.returnAddress)?.name}</h4>
                      <p>{getLocationById(formData.returnAddress)?.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="date-time-row">
                <div className="form-group">
                  <label>
                    תאריך החזרה *
                    <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                    </svg>
                  </label>
                  <DatePicker
                    selected={formData.returnDate}
                    onChange={(date) => handleInputChange('returnDate', date)}
                    onBlur={() => handleBlur('returnDate', formData.returnDate)}
                    filterDate={filterDates}
                    minDate={latestDate}
                    placeholderText="בחר תאריך"
                    className={errors.returnDate ? 'error' : ''}
                    dateFormat="dd/MM/yyyy"
                  />
                  {errors.returnDate && touched.returnDate && (
                    <span className="error-message">{errors.returnDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="returnTime">
                    שעת החזרה *
                    <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                  </label>
                  <select
                    id="returnTime"
                    value={formData.returnTime}
                    onChange={(e) => handleInputChange('returnTime', e.target.value)}
                    onBlur={(e) => handleBlur('returnTime', e.target.value)}
                    className={errors.returnTime ? 'error' : ''}
                    required
                  >
                    <option value="">בחר שעה</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.returnTime && touched.returnTime && (
                    <span className="error-message">{errors.returnTime}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="form-group full-width">
            <label htmlFor="specialInstructions">
              הוראות מיוחדות (אופציונלי)
              <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </label>
            <textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="הזן הוראות מיוחדות לאיסוף או החזרה..."
              rows="4"
            />
          </div>

          <div className="important-notes">
            <h4>
              <svg className="notice-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,20H14V22H10V20M12,2A6,6 0 0,1 18,8C18,10.22 16.79,12.16 15,13.2V15A1,1 0 0,1 14,16H10A1,1 0 0,1 9,15V13.2C7.21,12.16 6,10.22 6,8A6,6 0 0,1 12,2M16,8A4,4 0 0,0 8,8C8,9.54 9.0,10.89 10.5,11.5V14H13.5V11.5C15,10.89 16,9.54 16,8Z"/>
              </svg>
              הערות חשובות
            </h4>
            <ul>
              <li>אנא הגע במועד הנקוב לאיסוף הציוד</li>
              <li>העלאת תעודת זהות נדרשת לאימות</li>
              <li>ציוד שלא יוחזר בזמן יחויב בעמלת איחור</li>
              <li>במקרה של נזק לציוד, יחול תשלום נוסף לפי מחירון</li>
            </ul>
          </div>
        </form>
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canProceed}
        >
          המשך לחתימה על הסכם ←
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
        >
          ← חזור לפרטים אישיים
        </button>
      </div>
    </div>
  );
};

export default PickupReturnDetails; 