import React, { useState } from "react";
import "./FirstTimeWelcome.css";

const FirstTimeWelcome = ({ onChoice, canProceed }) => {
  const [selectedChoice, setSelectedChoice] = useState("");

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    onChoice(choice);
  };

  return (
    <div className="first-time-welcome">
      <div className="welcome-header">
        <div className="welcome-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6,2C5.79,2 5.59,2.06 5.44,2.17L2.17,5.44C1.96,5.66 1.88,6 2,6.3L3.5,10.5L2,14.7C1.88,15 1.96,15.34 2.17,15.56L5.44,18.83C5.65,19.04 6,19.12 6.29,19L10.5,17.5L14.71,19C15,19.12 15.35,19.04 15.56,18.83L18.83,15.56C19.04,15.35 19.12,15 19,14.71L17.5,10.5L19,6.29C19.12,6 19.04,5.65 18.83,5.44L15.56,2.17C15.35,1.96 15,1.88 14.71,2L10.5,3.5L6.29,2C6.2,1.97 6.1,1.97 6,2M10.5,6A4.5,4.5 0 0,1 15,10.5A4.5,4.5 0 0,1 10.5,15A4.5,4.5 0 0,1 6,10.5A4.5,4.5 0 0,1 10.5,6M10.5,8A2.5,2.5 0 0,0 8,10.5A2.5,2.5 0 0,0 10.5,13A2.5,2.5 0 0,0 13,10.5A2.5,2.5 0 0,0 10.5,8Z"/>
          </svg>
        </div>
        <h1>ברוכים הבאים לשולא השכרת ציוד!</h1>
        <p>כאן תתחילו במסע של השכרת ציוד מקצועי ואמין. בואו נלמד יחד על התהליך</p>
      </div>

      <div className="welcome-content">
        <div className="info-section">
          <h2>
            <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
            </svg>
            מה צריך לדעת על תהליך ההשכרה
          </h2>
          
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>בחירת ציוד</h3>
                <p>בחרו מתוך מגוון רחב של ציוד מקצועי ואיכותי</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>הזמנה ותיאום</h3>
                <p>תיאום מועדי איסוף והחזרה לפי הנוחות שלכם</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>שירות והתחזוקה</h3>
                <p>ציוד נבדק ומוכן לשימוש, עם תמיכה לאורך כל התקופה</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>החזרה פשוטה</h3>
                <p>החזרת הציוד במועד הנקוב, פשוט ונוח</p>
              </div>
            </div>
          </div>
        </div>

        <div className="requirements-section">
          <h2>
            <svg className="requirements-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            מה נדרש ממך כלקוח חדש
          </h2>
          
          <div className="requirements-list">
            <div className="requirement-item">
              <span className="req-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
              </span>
              <div className="req-content">
                <strong>פרטים אישיים</strong>
                <p>שם מלא, טלפון, מייל ותעודת זהות</p>
              </div>
            </div>

            <div className="requirement-item">
              <span className="req-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </span>
              <div className="req-content">
                <strong>חתימה על הסכם</strong>
                <p>הסכם השכירות המפרט את תנאי השימוש</p>
              </div>
            </div>

            <div className="requirement-item">
              <span className="req-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,12L11,14L15,10L13.59,8.59L11,11.17L10.41,10.59L9,12M12,2A7,7 0 0,1 19,9C19,14.25 12,22 12,22C12,22 5,14.25 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9C7,13 12,18.71 12,18.71C12,18.71 17,13 17,9A5,5 0 0,0 12,4Z"/>
                </svg>
              </span>
              <div className="req-content">
                <strong>אישור זהות</strong>
                <p>העלאת תמונה של תעודת זהות לאישור</p>
              </div>
            </div>
          </div>
        </div>

        <div className="membership-benefits">
          <h2>
            <svg className="benefits-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,16L3,5H1V3H4L6,14H18.5L19.5,7H8V5H21L19,19H7L5,16M9,19A1,1 0 0,0 8,20A1,1 0 0,0 9,21A1,1 0 0,0 10,20A1,1 0 0,0 9,19M18,19A1,1 0 0,0 17,20A1,1 0 0,0 18,21A1,1 0 0,0 19,20A1,1 0 0,0 18,19Z"/>
            </svg>
            יתרונות לקוחות קבועים
          </h2>
          
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                </svg>
              </span>
              <span>הנחות מיוחדות בהשכרות עתידיות</span>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H16A1,1 0 0,1 15,21V19H9V21A1,1 0 0,1 8,22H4V20H6A1,1 0 0,0 7,19V17H2V7H7V5A1,1 0 0,1 8,4H16A1,1 0 0,1 17,5V7M15,17V9H9V17H15Z"/>
                </svg>
              </span>
              <span>תהליך הזמנה מהיר יותר בעתיד</span>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                </svg>
              </span>
              <span>גישה מועדפת לציוד חדש ומיוחד</span>
            </div>
          </div>
        </div>

        <div className="choice-section">
          <h2>
            <svg className="target-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10Z"/>
            </svg>
            איך תרצה להשלים את התהליך?
          </h2>
          <p className="choice-description">
            בחר את הדרך הנוחה לך להשלמת תהליך ההזמנה
          </p>

          <div className="choice-cards">
            <div 
              className="choice-card recommended"
              onClick={() => handleChoice("online")}
            >
              <div className="choice-header">
                <h3>השלמה מקוונת</h3>
                <span className="recommended-badge">
                  <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                  מומלץ
                </span>
              </div>
              <div className="choice-benefits">
                <p>
                  <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  מלא את כל הפרטים עכשיו באתר
                </p>
                <p>
                  <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  חתום על ההסכם דיגיטלית
                </p>
                <p>
                  <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  העלה תמונת תעודת זהות
                </p>
              </div>
              <div className="choice-time">
                <svg className="clock-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
                </svg>
                זמן משוער: 5-7 דקות
              </div>
            </div>

            <div 
              className="choice-card"
              onClick={() => handleChoice("in-person")}
            >
              <div className="choice-header">
                <h3>השלמה אישית</h3>
              </div>
              <div className="choice-benefits">
                <p>
                  <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  רק בחר את הציוד עכשיו
                </p>
                <p>
                  <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  מלא פרטים אצלנו בעת האיסוף
                </p>
                <p>
                  <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                  חתום על ההסכם בנוכחותנו
                </p>
              </div>
              <div className="choice-time">
                <svg className="clock-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
                </svg>
                זמן נוסף באיסוף: 10-15 דקות
              </div>
            </div>
          </div>
        </div>

        <div className="important-notice">
          <div className="notice-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
          </div>
          <div className="notice-content">
            <h4>חשוב לדעת</h4>
            <p>
              לא משנה איזה אופציה תבחרו, אנו מתחייבים לחוויית לקוח מעולה ושירות מקצועי ואמין. 
              הבחירה היא לפי הנוחות שלכם בלבד.
            </p>
          </div>
        </div>
      </div>

      <div className="welcome-actions">
        {selectedChoice && (
          <div className="selected-choice-info">
            <p>
              בחרת ב: <strong>
                {selectedChoice === "online" ? "השלמה אונליין" : "השלמה אישית"}
              </strong>
            </p>
          </div>
        )}
        
        <button 
          className="btn-primary continue-btn"
          disabled={!selectedChoice}
          onClick={() => selectedChoice && onChoice(selectedChoice)}
        >
          {selectedChoice === "online" 
            ? "המשך למילוי פרטים אונליין →" 
            : selectedChoice === "in-person" 
            ? "המשך לסיכום הזמנה →" 
            : "בחר אופן השלמה כדי להמשיך"
          }
        </button>
      </div>
    </div>
  );
};

export default FirstTimeWelcome; 