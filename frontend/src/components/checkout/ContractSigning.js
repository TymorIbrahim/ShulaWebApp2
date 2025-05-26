import React, { useState, useRef } from "react";
import "./ContractSigning.css";

const ContractSigning = ({ data, customerInfo, onUpdate, onNext, onPrev, canProceed }) => {
  const [agreed, setAgreed] = useState(data.signed);
  const [signature, setSignature] = useState(data.signatureData);
  const [isDrawing, setIsDrawing] = useState(false);
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

  const handleAgreementChange = (checked) => {
    setAgreed(checked);
    const hasValidSignature = signature && signature !== null;
    onUpdate({ 
      signed: checked && hasValidSignature,
      signatureData: signature,
      agreementVersion: "1.0",
      signedAt: checked && hasValidSignature ? new Date().toISOString() : null
    });
  };

  const handleNext = () => {
    if (canProceed && agreed && signature) {
      onNext();
    }
  };

  return (
    <div className="contract-signing-step">
      <div className="step-header">
        <h2>✍️ חתימה על הסכם השכירות</h2>
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
                onChange={(e) => handleAgreementChange(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">
                אני מאשר/ת שקראתי והבנתי את תנאי ההסכם ואני מסכים/ה להם במלואם
              </span>
            </label>
          </div>

          {agreed && !signature && (
            <div className="signature-reminder">
              <span className="reminder-icon">⚠️</span>
              <span>נדרש לחתום בתיבת החתימה למעלה</span>
            </div>
          )}

          {agreed && signature && (
            <div className="signature-confirmed">
              <span className="confirmed-icon">✅</span>
              <span>החתימה נקלטה בהצלחה</span>
            </div>
          )}
        </div>

        <div className="legal-notice">
          <h4>🔒 הערה משפטית</h4>
          <p>
            חתימה דיגיטלית זו מהווה הסכמה משפטית מחייבת. 
            ההסכם נשמר במערכת שלנו ויישלח אליך בדוא"ל לאחר השלמת ההזמנה.
            במקרה של שאלות, ניתן ליצור קשר בכל עת.
          </p>
        </div>
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className="btn-primary"
          onClick={handleNext}
          disabled={!canProceed}
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