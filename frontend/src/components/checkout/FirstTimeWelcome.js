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
        <div className="welcome-icon">🏗️</div>
        <h1>ברוכים הבאים לשולא השכרת ציוד!</h1>
        <p className="welcome-subtitle">
          אנחנו נרגשים להצטרף אליכם למסע שלכם בעולם הבנייה והקבלנות
        </p>
      </div>

      <div className="welcome-content">
        <div className="info-section">
          <h2>📋 מה צריך לדעת על תהליך ההשכרה</h2>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="card-icon">🔧</div>
              <h3>ציוד איכותי ומקצועי</h3>
              <p>ציוד בנייה וקבלנות איכותי וחדיש, מתוחזק בקפידה ובדוק לפני כל השכרה</p>
            </div>

            <div className="info-card">
              <div className="card-icon">📍</div>
              <h3>איסוף והחזרה נוח</h3>
              <p>
                <strong>כתובת:</strong> טבריה 15, חיפה<br/>
                <strong>שעות:</strong> 17:00-19:00 בלבד<br/>
                <strong>איסוף:</strong> ביום תחילת השכירות<br/>
                <strong>החזרה:</strong> ביום סיום השכירות
              </p>
            </div>

            <div className="info-card">
              <div className="card-icon">💵</div>
              <h3>תשלום פשוט ובטוח</h3>
              <p>תשלום במזומן בלבד בעת איסוף הציוד - בלי עמלות וללא הפתעות</p>
            </div>

            <div className="info-card">
              <div className="card-icon">🤝</div>
              <h3>שירות מקצועי</h3>
              <p>ייעוץ מקצועי, הדרכה על השימוש בציוד ותמיכה טכנית לאורך כל התקופה</p>
            </div>
          </div>
        </div>

        <div className="requirements-section">
          <h2>📝 מה נדרש ממך כלקוח חדש</h2>
          
          <div className="requirements-list">
            <div className="requirement-item">
              <span className="req-icon">👤</span>
              <div className="req-content">
                <strong>פרטים אישיים מלאים</strong>
                <p>שם מלא, טלפון, אימייל ומספר תעודת זהות</p>
              </div>
            </div>

            <div className="requirement-item">
              <span className="req-icon">✍️</span>
              <div className="req-content">
                <strong>חתימה על הסכם השכירות</strong>
                <p>הסכם קצר ופשוט המגדיר את תנאי השימוש והאחריות</p>
              </div>
            </div>

            <div className="requirement-item">
              <span className="req-icon">📄</span>
              <div className="req-content">
                <strong>העלאת תעודת זהות</strong>
                <p>תמונה ברורה של תעודת הזהות לאימות זהות ובטחון</p>
              </div>
            </div>

            <div className="requirement-item">
              <span className="req-icon">🔒</span>
              <div className="req-content">
                <strong>אבטחת מידע</strong>
                <p>כל המידע שלך מוגן ומוצפן בהתאם לתקנות הגנת הפרטיות</p>
              </div>
            </div>
          </div>
        </div>

        <div className="membership-benefits">
          <h2>🎁 יתרונות לקוחות קבועים</h2>
          
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <p><strong>השכרות מהירות:</strong> תהליך מקוצר להשכרות עתידיות</p>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <p><strong>הנחות ללקוחות קבועים:</strong> מחירים מועדפים ומבצעים בלעדיים</p>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">📱</span>
              <p><strong>עדכונים וייעוץ:</strong> טיפים מקצועיים, מידע על ציוד חדש והודעות על מבצעים</p>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">🏆</span>
              <p><strong>שירות מועדף:</strong> עדיפות בהזמנות ותמיכה מקצועית מועדפת</p>
            </div>
          </div>
        </div>

        <div className="choice-section">
          <h2>🎯 איך תרצה להשלים את התהליך?</h2>
          <p className="choice-description">
            אתה יכול לבחור לבצע את התהליך כולו אונליין עכשיו, או להגיע לאיסוף הציוד ולבצע את התהליך איתנו אישית.
          </p>

          <div className="choice-options">
            <div 
              className={`choice-card ${selectedChoice === "online" ? "selected" : ""}`}
              onClick={() => handleChoice("online")}
            >
              <div className="choice-icon">💻</div>
              <h3>השלמה אונליין</h3>
              <div className="choice-details">
                <p>✅ מלא את כל הפרטים עכשיו באתר</p>
                <p>✅ חתום על ההסכם דיגיטלית</p>
                <p>✅ העלה תמונת תעודת זהות</p>
                <p>⚡ <strong>איסוף מהיר:</strong> רק לקחת את הציוד ולשלם</p>
              </div>
              <div className="choice-time">⏱️ זמן משוער: 5-7 דקות</div>
            </div>

            <div 
              className={`choice-card ${selectedChoice === "in-person" ? "selected" : ""}`}
              onClick={() => handleChoice("in-person")}
            >
              <div className="choice-icon">🤝</div>
              <h3>השלמה אישית</h3>
              <div className="choice-details">
                <p>✅ רק בחר את הציוד עכשיו</p>
                <p>✅ מלא פרטים אצלנו בעת האיסוף</p>
                <p>✅ חתום על ההסכם בנוכחותנו</p>
                <p>🤝 <strong>שירות אישי:</strong> ייעוץ והדרכה על הציוד</p>
              </div>
              <div className="choice-time">⏱️ זמן נוסף באיסוף: 10-15 דקות</div>
            </div>
          </div>
        </div>

        <div className="important-notice">
          <div className="notice-icon">⚠️</div>
          <div className="notice-content">
            <h4>חשוב לדעת</h4>
            <ul>
              <li>תהליך זה מתבצע פעם אחת בלבד - להשכרות עתידיות התהליך יהיה מהיר ופשוט</li>
              <li>לאחר השלמת התהליך תהפוך ללקוח רשום עם כל הזכויות והיתרונות</li>
              <li>שעות איסוף והחזרה: 17:00-19:00 בלבד</li>
              <li>הביאו בדיוק את הסכום במזומן</li>
            </ul>
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