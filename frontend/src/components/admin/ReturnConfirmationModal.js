import React, { useState, useEffect } from 'react';
import { confirmOrderReturn } from '../../services/orderService';
import './ReturnConfirmationModal.css';

const ReturnConfirmationModal = ({ order, onClose, onSuccess }) => {
  const [returnData, setReturnData] = useState({
    returnedBy: '',
    summaryReport: {
      // Customer behavior assessment
      customerBehavior: {
        punctuality: '',
        communication: '',
        productCare: '',
        compliance: ''
      },
      
      // Products condition
      productsCondition: [],
      
      // Overall assessment
      overallExperience: '',
      
      // Financial impact
      additionalCharges: {
        lateFees: 0,
        damageFees: 0,
        maintenanceFees: 0,
        replacementFees: 0,
        other: 0,
        otherDescription: ''
      },
      
      // Future recommendations
      futureRecommendations: {
        approveForFutureRentals: true,
        requiresSpecialAttention: false,
        recommendedCustomerCategory: 'standard'
      },
      
      // Notes
      staffNotes: '',
      publicNotes: '',
      internalNotes: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (order?.items) {
      // Initialize products condition with order items
      const initialProducts = order.items.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        conditionOnReturn: '',
        requiresMaintenance: false,
        requiresRepair: false,
        isDiscarded: false,
        maintenanceNotes: '',
        repairNotes: '',
        discardReason: '',
        staffNotes: ''
      }));
      
      setReturnData(prev => ({
        ...prev,
        summaryReport: {
          ...prev.summaryReport,
          productsCondition: initialProducts
        }
      }));
    }
  }, [order]);

  const updateSummaryReport = (field, value) => {
    setReturnData(prev => ({
      ...prev,
      summaryReport: {
        ...prev.summaryReport,
        [field]: value
      }
    }));
  };

  const updateNestedField = (section, field, value) => {
    setReturnData(prev => ({
      ...prev,
      summaryReport: {
        ...prev.summaryReport,
        [section]: {
          ...prev.summaryReport[section],
          [field]: value
        }
      }
    }));
  };

  const updateProductCondition = (index, field, value) => {
    setReturnData(prev => ({
      ...prev,
      summaryReport: {
        ...prev.summaryReport,
        productsCondition: prev.summaryReport.productsCondition.map((product, i) =>
          i === index ? { ...product, [field]: value } : product
        )
      }
    }));
  };

  const calculateReturnTiming = () => {
    if (!order?.items?.length) return { message: 'לא ניתן לחשב', color: '#6b7280' };
    
    const expectedReturnDate = new Date(Math.max(...order.items.map(item => new Date(item.rentalPeriod.endDate))));
    const currentDate = new Date();
    
    const timeDiff = currentDate - expectedReturnDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 0) {
      return { 
        message: `מאוחר ב-${daysDiff} ימים`, 
        color: '#ef4444',
        timing: 'late'
      };
    } else if (daysDiff < -1) {
      return { 
        message: `מוקדם ב-${Math.abs(daysDiff)} ימים`, 
        color: '#3b82f6',
        timing: 'early'
      };
    } else {
      return { 
        message: 'בזמן', 
        color: '#10b981',
        timing: 'onTime'
      };
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return returnData.returnedBy.trim() !== '';
      case 2:
        return returnData.summaryReport.productsCondition.every(p => p.conditionOnReturn !== '');
      case 3:
        const behavior = returnData.summaryReport.customerBehavior;
        return behavior.punctuality && behavior.communication && 
               behavior.productCare && behavior.compliance;
      case 4:
        return returnData.summaryReport.overallExperience !== '' &&
               returnData.summaryReport.futureRecommendations.recommendedCustomerCategory !== '';
      default:
        return true;
    }
  };

  const canSubmit = () => {
    return isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4);
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('אנא השלם את כל השדות הנדרשים');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = JSON.parse(localStorage.getItem('user') || '{}').token || 
                   JSON.parse(localStorage.getItem('user') || '{}').accessToken;
      
      await confirmOrderReturn(order._id, returnData, token);
      
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'שגיאה באישור החזרת ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  const returnTiming = calculateReturnTiming();

  if (!order) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>פרטי החזרה בסיסיים</h3>
            
            <div className="return-timing-card" style={{ borderColor: returnTiming.color }}>
              <h4>זמן החזרה</h4>
              <div className="timing-status" style={{ color: returnTiming.color }}>
                {returnTiming.message}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="returnedBy">שם איש הצוות המקבל החזרה *</label>
              <input
                type="text"
                id="returnedBy"
                value={returnData.returnedBy}
                onChange={(e) => setReturnData(prev => ({ ...prev, returnedBy: e.target.value }))}
                placeholder="הכנס את שמך המלא..."
                className="staff-input"
                required
              />
            </div>

            <div className="customer-summary">
              <h4>סיכום לקוח</h4>
              <div className="customer-details">
                <div className="detail-item">
                  <span className="label">שם:</span>
                  <span className="value">
                    {(typeof order.user?.firstName === 'string' ? order.user.firstName : '')} {(typeof order.user?.lastName === 'string' ? order.user.lastName : '')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">מספר פריטים:</span>
                  <span className="value">{order.items?.length || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="label">ערך השכירות:</span>
                  <span className="value">₪{order.totalValue}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>מצב הפריטים בהחזרה</h3>
            
            {returnData.summaryReport.productsCondition.map((product, index) => (
              <div key={index} className="product-condition-card">
                <div className="product-header">
                  <h4>{product.productName}</h4>
                </div>
                
                <div className="condition-form">
                  <div className="form-group">
                    <label>מצב הפריט בהחזרה *</label>
                    <select
                      value={product.conditionOnReturn}
                      onChange={(e) => updateProductCondition(index, 'conditionOnReturn', e.target.value)}
                      className="condition-select"
                      required
                    >
                      <option value="">בחר מצב...</option>
                      <option value="excellent">מעולה - כמו חדש</option>
                      <option value="good">טוב - במצב תקין</option>
                      <option value="fair">בסדר - סימני שימוש קלים</option>
                      <option value="damaged">פגום - נזק קל</option>
                      <option value="broken">שבור - נזק משמעותי</option>
                      <option value="missing">חסר - לא הוחזר</option>
                    </select>
                  </div>

                  <div className="maintenance-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={product.requiresMaintenance}
                        onChange={(e) => updateProductCondition(index, 'requiresMaintenance', e.target.checked)}
                      />
                      <span>דורש תחזוקה</span>
                    </label>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={product.requiresRepair}
                        onChange={(e) => updateProductCondition(index, 'requiresRepair', e.target.checked)}
                      />
                      <span>דורש תיקון</span>
                    </label>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={product.isDiscarded}
                        onChange={(e) => updateProductCondition(index, 'isDiscarded', e.target.checked)}
                      />
                      <span>יש להשליך</span>
                    </label>
                  </div>

                  {product.requiresMaintenance && (
                    <div className="form-group">
                      <label>הערות תחזוקה</label>
                      <textarea
                        value={product.maintenanceNotes}
                        onChange={(e) => updateProductCondition(index, 'maintenanceNotes', e.target.value)}
                        placeholder="פרט את סוג התחזוקה הנדרשת..."
                        className="notes-textarea"
                        rows="2"
                      />
                    </div>
                  )}

                  {product.requiresRepair && (
                    <div className="form-group">
                      <label>הערות תיקון</label>
                      <textarea
                        value={product.repairNotes}
                        onChange={(e) => updateProductCondition(index, 'repairNotes', e.target.value)}
                        placeholder="פרט את סוג התיקון הנדרש..."
                        className="notes-textarea"
                        rows="2"
                      />
                    </div>
                  )}

                  {product.isDiscarded && (
                    <div className="form-group">
                      <label>סיבת השלכה</label>
                      <textarea
                        value={product.discardReason}
                        onChange={(e) => updateProductCondition(index, 'discardReason', e.target.value)}
                        placeholder="פרט מדוע יש להשליך את הפריט..."
                        className="notes-textarea"
                        rows="2"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>הערות צוות על הפריט</label>
                    <input
                      type="text"
                      value={product.staffNotes}
                      onChange={(e) => updateProductCondition(index, 'staffNotes', e.target.value)}
                      placeholder="הערות נוספות..."
                      className="notes-input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>הערכת התנהגות לקוח</h3>
            
            <div className="behavior-assessment">
              <div className="assessment-item">
                <label>דייקנות *</label>
                <div className="rating-options">
                  {['excellent', 'good', 'fair', 'poor'].map(rating => (
                    <label key={rating} className="radio-label">
                      <input
                        type="radio"
                        name="punctuality"
                        value={rating}
                        checked={returnData.summaryReport.customerBehavior.punctuality === rating}
                        onChange={(e) => updateNestedField('customerBehavior', 'punctuality', e.target.value)}
                      />
                      <span className={`rating-text ${rating}`}>
                        {rating === 'excellent' ? 'מעולה' : 
                         rating === 'good' ? 'טוב' : 
                         rating === 'fair' ? 'בסדר' : 'גרוע'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="assessment-item">
                <label>תקשורת *</label>
                <div className="rating-options">
                  {['excellent', 'good', 'fair', 'poor'].map(rating => (
                    <label key={rating} className="radio-label">
                      <input
                        type="radio"
                        name="communication"
                        value={rating}
                        checked={returnData.summaryReport.customerBehavior.communication === rating}
                        onChange={(e) => updateNestedField('customerBehavior', 'communication', e.target.value)}
                      />
                      <span className={`rating-text ${rating}`}>
                        {rating === 'excellent' ? 'מעולה' : 
                         rating === 'good' ? 'טוב' : 
                         rating === 'fair' ? 'בסדר' : 'גרוע'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="assessment-item">
                <label>טיפול במוצרים *</label>
                <div className="rating-options">
                  {['excellent', 'good', 'fair', 'poor'].map(rating => (
                    <label key={rating} className="radio-label">
                      <input
                        type="radio"
                        name="productCare"
                        value={rating}
                        checked={returnData.summaryReport.customerBehavior.productCare === rating}
                        onChange={(e) => updateNestedField('customerBehavior', 'productCare', e.target.value)}
                      />
                      <span className={`rating-text ${rating}`}>
                        {rating === 'excellent' ? 'מעולה' : 
                         rating === 'good' ? 'טוב' : 
                         rating === 'fair' ? 'בסדר' : 'גרוע'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="assessment-item">
                <label>עמידה בכללים *</label>
                <div className="rating-options">
                  {['excellent', 'good', 'fair', 'poor'].map(rating => (
                    <label key={rating} className="radio-label">
                      <input
                        type="radio"
                        name="compliance"
                        value={rating}
                        checked={returnData.summaryReport.customerBehavior.compliance === rating}
                        onChange={(e) => updateNestedField('customerBehavior', 'compliance', e.target.value)}
                      />
                      <span className={`rating-text ${rating}`}>
                        {rating === 'excellent' ? 'מעולה' : 
                         rating === 'good' ? 'טוב' : 
                         rating === 'fair' ? 'בסדר' : 'גרוע'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>הערכה כללית והמלצות</h3>
            
            <div className="form-group">
              <label>חוויה כללית *</label>
              <select
                value={returnData.summaryReport.overallExperience}
                onChange={(e) => updateSummaryReport('overallExperience', e.target.value)}
                className="experience-select"
              >
                <option value="">בחר הערכה...</option>
                <option value="excellent">מעולה</option>
                <option value="good">טוב</option>
                <option value="satisfactory">מספק</option>
                <option value="problematic">בעייתי</option>
                <option value="poor">גרוע</option>
              </select>
            </div>

            <div className="recommendations-section">
              <h4>המלצות עתידיות</h4>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={returnData.summaryReport.futureRecommendations.approveForFutureRentals}
                    onChange={(e) => updateNestedField('futureRecommendations', 'approveForFutureRentals', e.target.checked)}
                  />
                  <span>לאשר השכרות עתידיות</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={returnData.summaryReport.futureRecommendations.requiresSpecialAttention}
                    onChange={(e) => updateNestedField('futureRecommendations', 'requiresSpecialAttention', e.target.checked)}
                  />
                  <span>דורש תשומת לב מיוחדת</span>
                </label>
              </div>

              <div className="form-group">
                <label>קטגוריית לקוח מומלצת *</label>
                <select
                  value={returnData.summaryReport.futureRecommendations.recommendedCustomerCategory}
                  onChange={(e) => updateNestedField('futureRecommendations', 'recommendedCustomerCategory', e.target.value)}
                  className="category-select"
                >
                  <option value="premium">פרימיום - ללא הגבלות</option>
                  <option value="standard">סטנדרט - רגיל</option>
                  <option value="cautious">זהירות - עם מעקב</option>
                  <option value="restricted">מוגבל - בצורך בחירום</option>
                </select>
              </div>
            </div>

            <div className="charges-section">
              <h4>חיובים נוספים</h4>
              
              <div className="charges-grid">
                <div className="form-group">
                  <label>קנסות איחור</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={returnData.summaryReport.additionalCharges.lateFees}
                    onChange={(e) => updateNestedField('additionalCharges', 'lateFees', parseFloat(e.target.value) || 0)}
                    className="charge-input"
                  />
                </div>

                <div className="form-group">
                  <label>קנסות נזק</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={returnData.summaryReport.additionalCharges.damageFees}
                    onChange={(e) => updateNestedField('additionalCharges', 'damageFees', parseFloat(e.target.value) || 0)}
                    className="charge-input"
                  />
                </div>

                <div className="form-group">
                  <label>עלויות תחזוקה</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={returnData.summaryReport.additionalCharges.maintenanceFees}
                    onChange={(e) => updateNestedField('additionalCharges', 'maintenanceFees', parseFloat(e.target.value) || 0)}
                    className="charge-input"
                  />
                </div>

                <div className="form-group">
                  <label>עלויות החלפה</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={returnData.summaryReport.additionalCharges.replacementFees}
                    onChange={(e) => updateNestedField('additionalCharges', 'replacementFees', parseFloat(e.target.value) || 0)}
                    className="charge-input"
                  />
                </div>

                <div className="form-group">
                  <label>אחר</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={returnData.summaryReport.additionalCharges.other}
                    onChange={(e) => updateNestedField('additionalCharges', 'other', parseFloat(e.target.value) || 0)}
                    className="charge-input"
                  />
                </div>
              </div>

              {returnData.summaryReport.additionalCharges.other > 0 && (
                <div className="form-group">
                  <label>תיאור חיוב אחר</label>
                  <input
                    type="text"
                    value={returnData.summaryReport.additionalCharges.otherDescription}
                    onChange={(e) => updateNestedField('additionalCharges', 'otherDescription', e.target.value)}
                    placeholder="פרט את סוג החיוב..."
                    className="notes-input"
                  />
                </div>
              )}

              <div className="total-charges">
                <strong>
                  סה"כ חיובים נוספים: ₪
                  {(
                    returnData.summaryReport.additionalCharges.lateFees +
                    returnData.summaryReport.additionalCharges.damageFees +
                    returnData.summaryReport.additionalCharges.maintenanceFees +
                    returnData.summaryReport.additionalCharges.replacementFees +
                    returnData.summaryReport.additionalCharges.other
                  ).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h3>הערות וסיכום</h3>
            
            <div className="form-group">
              <label htmlFor="staffNotes">הערות צוות (פנימי)</label>
              <textarea
                id="staffNotes"
                value={returnData.summaryReport.staffNotes}
                onChange={(e) => updateSummaryReport('staffNotes', e.target.value)}
                placeholder="הערות פנימיות לצוות..."
                className="notes-textarea"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="publicNotes">הערות ללקוח (יוצגו ללקוח)</label>
              <textarea
                id="publicNotes"
                value={returnData.summaryReport.publicNotes}
                onChange={(e) => updateSummaryReport('publicNotes', e.target.value)}
                placeholder="הערות שיוצגו ללקוח..."
                className="notes-textarea"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="internalNotes">הערות פנימיות (לא יוצגו ללקוח)</label>
              <textarea
                id="internalNotes"
                value={returnData.summaryReport.internalNotes}
                onChange={(e) => updateSummaryReport('internalNotes', e.target.value)}
                placeholder="הערות רגישות או פנימיות בלבד..."
                className="notes-textarea"
                rows="3"
              />
            </div>

            <div className="summary-preview">
              <h4>תקציר הדוח</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">חוויה כללית:</span>
                  <span className="value">{returnData.summaryReport.overallExperience || 'לא צוין'}</span>
                </div>
                <div className="summary-item">
                  <span className="label">קטגוריית לקוח:</span>
                  <span className="value">{returnData.summaryReport.futureRecommendations.recommendedCustomerCategory || 'לא צוין'}</span>
                </div>
                <div className="summary-item">
                  <span className="label">חיובים נוספים:</span>
                  <span className="value">
                    ₪{(
                      returnData.summaryReport.additionalCharges.lateFees +
                      returnData.summaryReport.additionalCharges.damageFees +
                      returnData.summaryReport.additionalCharges.maintenanceFees +
                      returnData.summaryReport.additionalCharges.replacementFees +
                      returnData.summaryReport.additionalCharges.other
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay return-modal-overlay" onClick={onClose}>
      <div className="return-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>אישור החזרת הזמנה</h2>
          <p>מזהה הזמנה: {order._id}</p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step} 
              className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              <span className="step-number">{step}</span>
              <span className="step-label">
                {step === 1 ? 'פרטים בסיסיים' :
                 step === 2 ? 'מצב פריטים' :
                 step === 3 ? 'הערכת לקוח' :
                 step === 4 ? 'המלצות' : 'סיכום'}
              </span>
            </div>
          ))}
        </div>

        <div className="modal-content">
          {renderStepContent()}
        </div>

        <div className="modal-footer">
          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="btn-secondary"
                disabled={loading}
              >
                קודם
              </button>
            )}
            
            <button 
              onClick={onClose} 
              className="btn-secondary"
              disabled={loading}
            >
              ביטול
            </button>
          </div>

          <div className="action-buttons">
            {currentStep < 5 ? (
              <button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                className={`btn-primary ${isStepValid(currentStep) ? '' : 'disabled'}`}
                disabled={!isStepValid(currentStep)}
              >
                הבא
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className={`btn-primary ${canSubmit() ? '' : 'disabled'}`}
                disabled={loading || !canSubmit()}
              >
                {loading ? 'מאשר החזרה...' : 'אשר החזרת הזמנה'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnConfirmationModal; 