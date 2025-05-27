import React, { useState } from "react";
import "./IDUpload.css";

const IDUpload = ({ data, onUpdate, onNext, onPrev, canProceed, processOrder }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setErrors([]);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(['סוג קובץ לא נתמך. אנא העלה תמונה בפורמט JPG, PNG או HEIC']);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(['גודל הקובץ חורג מ-10MB. אנא העלה קובץ קטן יותר']);
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload (in real app, upload to server/cloud storage)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, create a mock file URL
      const mockFileUrl = `mock-id-upload-${Date.now()}.jpg`;
      
      onUpdate({
        uploaded: true,
        fileName: file.name,
        fileUrl: mockFileUrl
      });

      console.log('ID uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(['שגיאה בהעלאת הקובץ. אנא נסה שוב']);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    onUpdate({
      uploaded: false,
      fileName: "",
      fileUrl: ""
    });
  };

  const handleCompleteOrder = async () => {
    if (!canProceed) {
      setErrors(['יש להעלות תעודת זהות לפני השלמת ההזמנה']);
      return;
    }

    setProcessing(true);
    setErrors([]);

    try {
      await processOrder();
      console.log('Order processed successfully');
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      onNext(); // Move to confirmation step
    } catch (error) {
      console.error('Order processing error:', error);
      setErrors(['שגיאה ביצירת ההזמנה. אנא נסה שוב']);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="id-upload-step">
      <div className="step-header">
        <h2>
          <svg className="document-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          העלאת תעודת זהות
        </h2>
        <p>העלה תמונה ברורה של תעודת הזהות שלך לאימות זהות</p>
      </div>

      <div className="upload-container">
        <div className="upload-requirements">
          <h4>דרישות לתמונת תעודת הזהות</h4>
          <ul className="requirements-list">
            <li>תמונה ברורה וחדה של הצד הקדמי של תעודת הזהות</li>
            <li>כל הפרטים חייבים להיות קריאים ובולטים</li>
            <li>פורמטים נתמכים: JPG, PNG, HEIC</li>
            <li>גודל מקסימלי: 10MB</li>
            <li>הימנע מהחזרי אור או צללים על התעודה</li>
          </ul>
        </div>

        {!data.uploaded ? (
          <div className="upload-section">
            <div 
              className={`upload-area ${dragActive ? 'dragover' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              {uploading ? (
                <div className="uploading-state">
                  <div className="upload-spinner"></div>
                  <p>מעלה קובץ...</p>
                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <svg className="document-upload-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div className="upload-text">
                    <strong>לחץ כאן או גרור קובץ</strong>
                  </div>
                  <div className="upload-hint">
                    תמונת תעודת זהות (JPG, PNG, HEIC עד 10MB)
                  </div>
                </>
              )}
              
              <input
                id="file-input"
                type="file"
                className="file-input"
                accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>
          </div>
        ) : (
          <div className="upload-success">
            <div className="success-content">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                </svg>
              </div>
              <h3>תעודת זהות הועלתה בהצלחה</h3>
              <div className="file-info">
                <p><strong>שם קובץ:</strong> {data.fileName}</p>
                <p><strong>סטטוס:</strong> הועלה בהצלחה</p>
              </div>
              <button 
                className="retake-btn"
                onClick={removeFile}
                disabled={processing}
              >
                העלה קובץ אחר
              </button>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="validation-errors">
            <h4>שגיאות</h4>
            <ul className="error-list">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="verification-notice">
          <div className="notice-header">
            <span className="notice-icon">
              <svg className="security-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M10.2,10C10.2,9.2 10.6,8 12,8C13.4,8 13.8,9.2 13.8,10V11H10.2V10Z"/>
              </svg>
            </span>
            <h4>אבטחת מידע</h4>
          </div>
          <p>
            תמונת תעודת הזהות תשמש לאימות זהות בלבד ותישמר באופן מוצפן. 
            המידע שלך מוגן בהתאם לתקנות הגנת הפרטיות.
          </p>
        </div>
      </div>

      <div className="step-actions">
        <button 
          type="button"
          className="btn-primary"
          onClick={handleCompleteOrder}
          disabled={!canProceed || processing}
        >
          {processing ? (
            <>
              <div className="spinner"></div>
              יוצר הזמנה...
            </>
          ) : (
            'השלם הזמנה →'
          )}
        </button>
        
        <button 
          type="button"
          className="btn-secondary"
          onClick={onPrev}
          disabled={processing}
        >
          ← חזור לחתימה על הסכם
        </button>
      </div>
    </div>
  );
};

export default IDUpload; 