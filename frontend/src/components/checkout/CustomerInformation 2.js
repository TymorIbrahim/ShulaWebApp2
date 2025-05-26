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
        <h2>👤 פרטים אישיים</h2>
        <p>אנא מלא את הפרטים האישיים שלך. כל השדות נדרשים להשלמת ההזמנה</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">
                שם פרטי *
                <span className="field-icon">👤</span>
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
                שם משפחה *
                <span className="field-icon">👤</span>
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
                כתובת אימייל *
                <span className="field-icon">📧</span>
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
                מספר טלפון *
                <span className="field-icon">📱</span>
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
                תעודת זהות *
                <span className="field-icon">🆔</span>
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
              <h4>🔒 הגנת פרטיות</h4>
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