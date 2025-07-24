import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './MembershipModal.css';

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

const MembershipModal = ({ customer, onClose, onMembershipUpdate }) => {
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [inPersonForm, setInPersonForm] = useState({
    location: '',
    notes: '',
    contractSigned: false,
    idVerified: false,
    idNotes: ''
  });



  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token || user.accessToken;
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
  };

  const fetchMembershipData = useCallback(async () => {
    if (!customer || !customer._id) {
      setError('נתוני לקוח חסרים');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const config = getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/api/users/membership/${customer._id}`,
        config
      );
      setMembershipData(response.data.user || response.data);
    } catch (err) {
      console.error('Error fetching membership data:', err);
      setError('שגיאה בטעינת נתוני החברות: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    fetchMembershipData();
  }, [fetchMembershipData]);

  const handleVerifyId = async (verified) => {
    try {
      setSaving(true);
      const config = getAuthHeaders();
      await axios.put(
        `${API_URL}/api/users/membership/verify-id`,
        { 
          userId: customer._id,
          verified, 
          notes: inPersonForm.idNotes 
        },
        config
      );
      
      setSuccess(`תעודת הזהות ${verified ? 'אושרה' : 'נדחתה'} בהצלחה`);
      await fetchMembershipData();
      onMembershipUpdate && onMembershipUpdate();
    } catch (err) {
      setError('שגיאה באישור תעודת זהות: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleProcessInPerson = async () => {
    try {
      setSaving(true);
      
      const payload = {
        userId: customer._id,
        inPersonDetails: {
          location: inPersonForm.location,
          notes: inPersonForm.notes
        }
      };

      if (inPersonForm.contractSigned) {
        payload.contract = {
          agreementVersion: '1.0'
        };
      }

      if (inPersonForm.idVerified) {
        payload.idVerification = {
          fileName: 'In_Person_Verification',
          notes: inPersonForm.idNotes
        };
      }

      const config = getAuthHeaders();
      await axios.put(
        `${API_URL}/api/users/membership/admin-process`,
        payload,
        config
      );
      
      setSuccess('חברות עובדה בהצלחה');
      await fetchMembershipData();
      onMembershipUpdate && onMembershipUpdate();
    } catch (err) {
      setError('שגיאה בעיבוד החברות');
    } finally {
      setSaving(false);
    }
  };

  const getMembershipStatusBadge = () => {
    if (!membershipData || !membershipData.membership || !membershipData.membership.isMember) {
      return <span className="membership-badge not-member">לא חבר</span>;
    }

    const membership = membershipData.membership;
    if (membership.membershipType === 'online') {
      return membership.idVerification?.verified 
        ? <span className="membership-badge online-verified">חבר מקוון - מאומת</span>
        : <span className="membership-badge online-pending">חבר מקוון - ממתין לאימות</span>;
    } else if (membership.membershipType === 'in_person') {
      return <span className="membership-badge in-person">חבר במקום</span>;
    }

    return <span className="membership-badge unknown">סטטוס לא ידוע</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  // Helper function to safely get processed by name
  const getProcessedByName = (processedBy) => {
    if (!processedBy) return 'לא ידוע';
    
    // If it's a string, return as is
    if (typeof processedBy === 'string') {
      return processedBy;
    }
    
    // If it's an object with name properties, extract them
    if (typeof processedBy === 'object') {
      const firstName = typeof processedBy.firstName === 'string' ? processedBy.firstName : '';
      const lastName = typeof processedBy.lastName === 'string' ? processedBy.lastName : '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || processedBy.email || processedBy._id || 'לא ידוע';
    }
    
    return 'לא ידוע';
  };

  if (!customer) {
    return (
      <div className="membership-modal-overlay" onClick={onClose}>
        <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>ניהול חברות</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="error-content">
            <p>נתוני לקוח חסרים</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="membership-modal-overlay">
        <div className="membership-modal">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>טוען נתוני חברות...</p>
          </div>
        </div>
      </div>
    );
  }

  const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'לקוח';

  return (
    <div className="membership-modal-overlay" onClick={onClose}>
      <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ניהול חברות - {customerName}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="membership-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            סקירה
          </button>
          <button 
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
            disabled={!membershipData?.membership?.isMember}
          >
            מסמכים
          </button>
          <button 
            className={`tab-btn ${activeTab === 'inperson' ? 'active' : ''}`}
            onClick={() => setActiveTab('inperson')}
          >
            עיבוד במקום
          </button>
        </div>

        <div className="modal-content">
          {!membershipData ? (
            <div className="no-data-message">
              <p>לא נמצאו נתוני חברות עבור משתמש זה</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="membership-status-card">
                    <h3>סטטוס חברות</h3>
                    {getMembershipStatusBadge()}
                    
                    {membershipData?.membership?.isMember && (
                  <div className="membership-details">
                    <div className="detail-row">
                      <span className="label">תאריך הצטרפות:</span>
                      <span className="value">{formatDate(membershipData.membership.membershipDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">סוג חברות:</span>
                      <span className="value">
                        {membershipData.membership.membershipType === 'online' ? 'מקוון' : 'במקום'}
                      </span>
                    </div>
                    
                    {membershipData.membership.contract?.signed && (
                      <div className="detail-row">
                        <span className="label">הסכם נחתם:</span>
                        <span className="value">נחתם ב- {formatDate(membershipData.membership.contract.signedAt)}</span>
                      </div>
                    )}
                    
                    <div className="detail-row">
                      <span className="label">אימות תעודת זהות:</span>
                      <span className="value">
                        {membershipData.membership.idVerification?.verified ? 'מאומת' : 'ממתין'}
                      </span>
                    </div>
                  </div>
                )}
                
                {!membershipData?.membership?.isMember && (
                  <div className="not-member-info">
                    <p>הלקוח עדיין לא השלים את תהליך ההצטרפות לחברות.</p>
                    <p>ניתן לעבד חברות במקום או לחכות להשלמה מקוונת.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && membershipData?.membership?.isMember && (
            <div className="documents-tab">
              <div className="documents-section">
                <h3>הסכם חברות</h3>
                {membershipData.membership.contract?.signed ? (
                  <div className="document-card">
                    <div className="document-info">
                      <span>הסכם נחתם</span>
                      <span className="date">נחתם: {formatDate(membershipData.membership.contract.signedAt)}</span>
                      <span className="version">גרסה: {membershipData.membership.contract.agreementVersion}</span>
                    </div>
                    {(membershipData.membership.contract.gcsSignatureUrl || membershipData.membership.contract.signatureData) && (
                      <div className="signature-preview">
                        <img 
                          src={membershipData.membership.contract.gcsSignatureUrl || membershipData.membership.contract.signatureData} 
                          alt="חתימה" 
                          className="signature-image"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-document">הסכם לא נחתם</div>
                )}
              </div>

              <div className="documents-section">
                <h3>תעודת זהות</h3>
                {(() => {
                  const idDoc = membershipData.membership?.idVerification || customer?.idUpload || membershipData?.idUpload;
                  if (!idDoc) return null;
                  
                  return (
                    <div className="document-card">
                      <div className="document-info">
                        <span>
                          {idDoc.verified || idDoc.uploaded ? 'מאומת' : 'ממתין לאימות'}
                        </span>
                        {idDoc.fileName && (
                          <span className="filename">{idDoc.fileName}</span>
                        )}
                        {(idDoc.uploadedAt || idDoc.uploadDate) && (
                          <span className="date">הועלה: {formatDate(idDoc.uploadedAt || idDoc.uploadDate)}</span>
                        )}
                      </div>
                      
                      {(idDoc.fileUrl || idDoc.gcsUrl) && (
                      <div className="document-actions">
                                                  <button 
                            className="btn-secondary"
                            onClick={() => {
                              const idUrl = idDoc.gcsUrl || idDoc.fileUrl;
                            if (idUrl.startsWith('data:') || idUrl.startsWith('http')) {
                              const newWindow = window.open('', '_blank');
                              newWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>תעודת זהות - ${customer.firstName || ''} ${customer.lastName || ''}</title>
                                    <style>
                                        body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                        img { max-width: 90%; max-height: 90vh; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                                        .container { text-align: center; }
                                        h2 { font-family: Arial, sans-serif; color: #333; margin-bottom: 20px; }
                                    </style>
                                </head>
                                <body>
                                    <div class="container">
                                        <h2>תעודת זהות - ${customer.firstName || ''} ${customer.lastName || ''}</h2>
                                        <img src="${idUrl}" alt="תעודת זהות" />
                                    </div>
                                </body>
                                </html>
                              `);
                              newWindow.document.close();
                            } else {
                              window.open(idUrl, '_blank');
                            }
                          }}
                        >
                          הצג תעודת זהות
                        </button>
                      </div>
                    )}
                    
                      {!idDoc.verified && (
                      <div className="verification-actions">
                        <textarea
                          placeholder="הערות אימות (אופציונלי)"
                          value={inPersonForm.idNotes}
                          onChange={(e) => setInPersonForm(prev => ({...prev, idNotes: e.target.value}))}
                          className="verification-notes"
                        />
                        <div className="verification-buttons">
                          <button 
                            className="btn-success"
                            onClick={() => handleVerifyId(true)}
                            disabled={saving}
                          >
                            אמת תעודת זהות
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleVerifyId(false)}
                            disabled={saving}
                          >
                            דחה תעודת זהות
                          </button>
                        </div>
                      </div>
                    )}
                    
                      {idDoc.notes && (
                        <div className="verification-notes-display">
                          <strong>הערות:</strong> {idDoc.notes}
                        </div>
                      )}
                    </div>
                  );
                })() || <div className="no-document">תעודת זהות לא הועלתה</div>}
              </div>
            </div>
          )}

          {activeTab === 'inperson' && (
            <div className="inperson-tab">
              <div className="inperson-form-card">
                <h3>עיבוד חברות במקום</h3>
                
                {membershipData?.membership?.isMember ? (
                  <div className="already-member-notice">
                    <p>הלקוח כבר חבר במערכת</p>
                    {membershipData.membership.inPersonDetails && (
                      <div className="existing-details">
                        <p><strong>עובד על ידי:</strong> {getProcessedByName(membershipData.membership.inPersonDetails.processedBy)}</p>
                        <p><strong>תאריך עיבוד:</strong> {formatDate(membershipData.membership.inPersonDetails.processedAt)}</p>
                        <p><strong>מיקום:</strong> {membershipData.membership.inPersonDetails.location}</p>
                        {membershipData.membership.inPersonDetails.notes && (
                          <p><strong>הערות:</strong> {membershipData.membership.inPersonDetails.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="inperson-form">
                    <div className="form-group">
                      <label>מיקום עיבוד</label>
                      <input
                        type="text"
                        placeholder="למשל: משרד, אירוע, תערוכה..."
                        value={inPersonForm.location}
                        onChange={(e) => setInPersonForm(prev => ({...prev, location: e.target.value}))}
                      />
                    </div>

                    <div className="form-group">
                      <label>הערות</label>
                      <textarea
                        placeholder="הערות נוספות על התהליך..."
                        value={inPersonForm.notes}
                        onChange={(e) => setInPersonForm(prev => ({...prev, notes: e.target.value}))}
                      />
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={inPersonForm.contractSigned}
                          onChange={(e) => setInPersonForm(prev => ({...prev, contractSigned: e.target.checked}))}
                        />
                        הסכם נחתם במקום
                      </label>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={inPersonForm.idVerified}
                          onChange={(e) => setInPersonForm(prev => ({...prev, idVerified: e.target.checked}))}
                        />
                        תעודת זהות אומתה במקום
                      </label>
                    </div>

                    {inPersonForm.idVerified && (
                      <div className="form-group">
                        <label>הערות אימות תעודת זהות</label>
                        <textarea
                          placeholder="פרטים על אימות תעודת הזהות..."
                          value={inPersonForm.idNotes}
                          onChange={(e) => setInPersonForm(prev => ({...prev, idNotes: e.target.value}))}
                        />
                      </div>
                    )}

                    <button 
                      className="btn-primary process-btn"
                      onClick={handleProcessInPerson}
                      disabled={saving || !inPersonForm.location}
                    >
                      {saving ? 'מעבד...' : 'עבד חברות במקום'}
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipModal; 