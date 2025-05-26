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
        <h2>📍 פרטי איסוף והחזרה</h2>
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
              <h3>🚚 איסוף</h3>
              
              <div className="form-group">
                <label htmlFor="pickupAddress">
                  מיקום איסוף *
                  <span className="field-icon">📍</span>
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
                    <span className="field-icon">📅</span>
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
                    <span className="field-icon">🕐</span>
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
              <h3>🔄 החזרה</h3>
              
              <div className="form-group">
                <label htmlFor="returnAddress">
                  מיקום החזרה *
                  <span className="field-icon">📍</span>
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
                    <span className="field-icon">📅</span>
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
                    <span className="field-icon">🕐</span>
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
              <span className="field-icon">📝</span>
            </label>
            <textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="הזן הוראות מיוחדות לאיסוף או החזרה..."
              rows="4"
            />
          </div>

          <div className="important-notice">
            <h4>🔔 הערות חשובות</h4>
            <ul>
              <li>איסוף והחזרה מתבצעים רק בימים: ראשון, שלישי וחמישי</li>
              <li>יש להביא תעודת זהות בעת האיסוף</li>
              <li>החזרה מאוחרת עלולה לגרור עלויות נוספות</li>
              <li>במקרה של שינוי בלוח הזמנים, נא ליצור קשר מראש</li>
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