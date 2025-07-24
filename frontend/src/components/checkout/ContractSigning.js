import React, { useState, useRef } from "react";
import axios from "axios";
import "./ContractSigning.css";

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";


const ContractSigning = ({ data, customerInfo, onUpdate, onNext, onPrev, canProceed }) => {
  const [agreed, setAgreed] = useState(data.signed);
  const [signature, setSignature] = useState(data.signatureData);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const contractText = `
הסכם השכרת ציוד

1. כללי
א. הסכם זה נערך בין "השולה" (להלן: "המשכיר") לבין ${customerInfo.firstName} ${customerInfo.lastName} (להלן: "השוכר").
ב. השוכר מאשר כי קרא והבין את תנאי ההסכם ומסכים להם במלואם.

2. תנאי השכירות
א. השכירות מתבצעת לתקופה מוגדרת בלבד.
ב. השוכר אחראי לשמירה על הציוד ולהחזרתו במצב תקין.
ג. איסוף והחזרה מתבצעים במועדים ובמקומות שנקבעו מראש.

3. אחריות ונזקים
א. השוכר אחראי לכל נזק שייגרם לציוד במהלך תקופת השכירות.
ב. בכל מקרה של נזק, השוכר ישלם את מלא עלות התיקון או ההחלפה.
ג. השוכר מתחייב להודיע למשכיר מיידית על כל נזק או תקלה.

4. תשלום
א. התשלום יבוצע בהתאם לתעריף שנקבע.
ב. במקרה של החזרה מאוחרת, ייגבה תשלום נוסף.
ג. פיקדון יוחזר בתום תקופת השכירות ובכפוף למצב הציוד.

5. ביטול וביטוח
א. השוכר רשאי לבטל את ההזמנה עד 24 שעות לפני מועד האיסוף.
ב. המשכיר אינו אחראי לנזקים עקיפים או אובדן הכנסה.

6. הוראות מיוחדות
א. השוכר מתחייב לעמוד בכל הוראות הבטיחות הרלוונטיות.
ב. אסור להשכיר או להעביר את הציוד לצד שלישי.

בחתימה מטה, השוכר מאשר הסכמתו לכל תנאי ההסכם.

תאריך: ${new Date().toLocaleDateString('he-IL')}
שם השוכר: ${customerInfo.firstName} ${customerInfo.lastName}
תעודת זהות: ${customerInfo.idNumber}
  `;

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563eb';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
      onUpdate({ 
        signatureData,
        signed: agreed && signatureData !== null
      });
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
    onUpdate({ 
      signatureData: null,
      signed: false
    });
  };

  const handleAgreementChange = (e) => {
    const isChecked = e.target.checked;
    setAgreed(isChecked);

    onUpdate({
      signed: isChecked && !!signature,
      agreementVersion: "1.0",
      signedAt: isChecked && !!signature ? new Date().toISOString() : null
    });
  };

  const handleNext = async () => {
    if (!canProceed || !agreed || !signature) {
      return;
    }

    setError(null);
    const canvas = canvasRef.current;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("שגיאה ביצירת חתימה דיגיטלית. נסה שוב.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append('signature', blob, 'signature.png');

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
          }
        };

        const response = await axios.post(`${API_URL}/api/uploads/signature`, formData, config);
        
        onUpdate({ 
          signatureData: response.data.filePath,
          signed: true,
          agreementVersion: "1.0",
          signedAt: new Date().toISOString()
        });

        onNext();
      } catch (err) {
        console.error("Signature upload failed inside blob callback:", err);
        setError(err.response?.data?.message || "העלאת החתימה נכשלה. בדוק את חיבור האינטרנט שלך ונסה שוב.");
      }
    }, 'image/png');
  };


  return (
    <div className="contract-signing-step">
      <div className="step-header">
        <h2>
          <svg className="contract-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          חתימה על הסכם השכירות
        </h2>
        <p>אנא קרא בעיון את ההסכם וחתום לאישור</p>
      </div>

      <div className="contract-container">
        <div className="contract-content">
          <h3>הסכם השכרת ציוד</h3>
          <div className="contract-text">
            <pre>{contractText}</pre>
          </div>
        </div>

        <div className="signature-section">
          <h3>חתימה דיגיטלית</h3>
          <p>אנא חתום בתיבה למטה:</p>
          
          <div className="signature-pad">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="signature-canvas"
            />
            <div className="signature-controls">
              <button 
                type="button" 
                onClick={clearSignature}
                className="clear-signature-btn"
              >
                נקה חתימה
              </button>
            </div>
          </div>

          <div className="agreement-checkbox">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agreed}
                onChange={handleAgreementChange}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                אני מאשר/ת שקראתי והבנתי את תנאי ההסכם ואני מסכים/ה להם במלואם
              </span>
            </label>
          </div>

          {agreed && !signature && (
            <div className="signature-reminder">
              <span className="reminder-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
              </span>
              <span>נדרש לחתום בתיבת החתימה למעלה</span>
            </div>
          )}

          {agreed && signature && (
            <div className="signature-confirmed">
              <span className="confirmed-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                </svg>
              </span>
              <span>החתימה נקלטה בהצלחה</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
              </span>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="legal-notice">
          <h4>
            <svg className="legal-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M10.2,10C10.2,9.2 10.6,8 12,8C13.4,8 13.8,9.2 13.8,10V11H10.2V10Z"/>
            </svg>
            הערה משפטית
          </h4>
          <p>
            חתימתך הדיגיטלית על הסכם זה מהווה התחייבות משפטית מחייבת.
            אנא קרא את כל התנאים בעיון לפני החתימה.
          </p>
        </div>
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className="btn-primary"
          onClick={handleNext}
          disabled={!agreed || !signature}
        >
          המשך להעלאת תעודת זהות ←
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
        >
          ← חזור לפרטי איסוף והחזרה
        </button>
      </div>
    </div>
  );
};

export default ContractSigning; 