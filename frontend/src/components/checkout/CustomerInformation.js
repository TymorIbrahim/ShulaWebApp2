import React, { useState, useEffect } from "react";
import "./CustomerInformation.css";

const CustomerInformation = ({ data, onUpdate, onNext, onPrev, canProceed }) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return value.trim().length < 2 ? 'שם פרטי חייב להכיל לפחות 2 תווים' : '';
      case 'lastName':
        return value.trim().length < 2 ? 'שם משפחה חייב להכיל לפחות 2 תווים' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'כתובת אימייל לא תקינה' : '';
      case 'phone':
        const phoneRegex = /^0[0-9]{1,2}-?[0-9]{7}$/;
        return !phoneRegex.test(value.replace(/\s/g, '')) ? 'מספר טלפון לא תקין (פורמט: 05X-XXXXXXX)' : '';
      case 'idNumber':
        const idRegex = /^[0-9]{9}$/;
        if (!idRegex.test(value)) {
          return 'תעודת זהות חייבת להכיל 9 ספרות';
        }
        // Israeli ID validation algorithm
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          let digit = parseInt(value[i]);
          if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
        }
        return sum % 10 !== 0 ? 'מספר תעודת זהות לא תקין' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    onUpdate({ [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      idNumber: true
    });
    
    if (Object.keys(newErrors).length === 0 && canProceed) {
      onNext();
    }
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    onUpdate({ phone: formatted });
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  return (
    <div className="customer-information-step">
      <div className="step-header">
        <h2>
          <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
          פרטים אישיים
        </h2>
        <p>אנא מלא את הפרטים הבאים להשלמת ההזמנה</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">
                <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                שם פרטי *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={errors.firstName ? 'error' : ''}
                placeholder="הזן שם פרטי"
                required
              />
              {errors.firstName && touched.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                שם משפחה *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={errors.lastName ? 'error' : ''}
                placeholder="הזן שם משפחה"
                required
              />
              {errors.lastName && touched.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="email">
                <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.11,4 20,4Z"/>
                </svg>
                כתובת אימייל *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={errors.email ? 'error' : ''}
                placeholder="example@email.com"
                required
              />
              {errors.email && touched.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
                מספר טלפון *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
                className={errors.phone ? 'error' : ''}
                placeholder="050-1234567"
                required
              />
              {errors.phone && touched.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">
                <svg className="field-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                תעודת זהות *
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={errors.idNumber ? 'error' : ''}
                placeholder="123456789"
                maxLength="9"
                required
              />
              {errors.idNumber && touched.idNumber && (
                <span className="error-message">{errors.idNumber}</span>
              )}
              <div className="field-help">
                נדרש להעלאת צילום תעודת הזהות בשלב הבא
              </div>
            </div>
          </div>

          <div className="privacy-notice">
            <div className="notice-content">
              <h4>
                <svg className="privacy-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M10.2,10C10.2,9.2 10.6,8 12,8C13.4,8 13.8,9.2 13.8,10V11H10.2V10Z"/>
                </svg>
                הגנת פרטיות
              </h4>
              <p>
                הפרטים שלך מוגנים ומוצפנים. אנו משתמשים במידע רק לצורך עיבוד ההזמנה
                ולא נשתף אותו עם צדדים שלישיים ללא הסכמתך המפורשת.
              </p>
            </div>
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
          המשך לפרטי איסוף והחזרה ←
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
        >
          ← חזור לסיכום הזמנה
        </button>
      </div>
    </div>
  );
};

export default CustomerInformation; 