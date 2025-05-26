import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminSettings.css';

// Enhanced SVG Icons
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
  </svg>
);

const SecurityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V19H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z" />
  </svg>
);

const SystemIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
  </svg>
);

const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
  </svg>
);

const DataIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,3C7.58,3 4,4.79 4,7V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V7C20,4.79 16.42,3 12,3M12,5C15.87,5 18,6.5 18,7C18,7.5 15.87,9 12,9C8.13,9 6,7.5 6,7C6,6.5 8.13,5 12,5M6,9.5C7.97,10.5 9.92,10.5 12,10.5C14.08,10.5 16.03,10.5 18,9.5V12C18,12.5 15.87,14 12,14C8.13,14 6,12.5 6,12V9.5M6,14.5C7.97,15.5 9.92,15.5 12,15.5C14.08,15.5 16.03,15.5 18,14.5V17C18,17.5 15.87,19 12,19C8.13,19 6,17.5 6,17V14.5Z" />
  </svg>
);

const PerformanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
  </svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12H20A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4V2M22,12L18,8V11H11V13H18V16L22,12Z" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
);

const AdminSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Profile settings
    profile: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: null,
      newPassword: '',
      currentPassword: '',
      confirmPassword: ''
    },
    
    // System settings
    system: {
      siteName: 'שולה - מערכת השכרה',
      maintenanceMode: false,
      allowSignups: true,
      defaultUserRole: 'customer',
      sessionTimeout: 24,
      maxRentalDays: 7,
      lateFeePerDay: 5,
      libraryHours: '09:00-17:00',
      timeZone: 'Asia/Jerusalem',
      language: 'he',
      theme: 'light'
    },
    
    // Security settings
    security: {
      passwordMinLength: 6,
      requireNumbersInPassword: true,
      requireSpecialCharsInPassword: false,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      twoFactorAuth: false,
      auditLogging: true,
      ipWhitelist: '',
      sslEnforced: true
    },
    
    // Notification settings
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      adminAlerts: true,
      orderConfirmations: true,
      reminderEmails: true,
      overdueNotifications: true,
      lowInventoryAlerts: true,
      systemMaintenanceAlerts: true,
      emailTemplates: {
        welcome: 'ברוך הבא למערכת שולה!',
        orderConfirmation: 'הזמנתך אושרה בהצלחה',
        reminder: 'תזכורת להחזרת פריט'
      }
    },
    
    // Data & Backup settings
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      exportFormat: 'CSV',
      analyticsRetention: 90,
      logRetention: 30,
      dataCompression: true
    },
    
    // Performance settings
    performance: {
      cacheEnabled: true,
      cacheDuration: 300,
      maxFileSize: 5,
      imageOptimization: true,
      lazyLoading: true,
      compressionEnabled: true,
      cdnEnabled: false
    }
  });

  // Check authentication and admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!user?.role?.includes('staff')) {
      navigate('/admin');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Handle input changes
  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  // Handle nested setting changes (like email templates)
  const handleNestedSettingChange = (category, parentField, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentField]: {
          ...prev[category][parentField],
          [field]: value
        }
      }
    }));
    setUnsavedChanges(true);
  };

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage({ type: 'error', text: 'גודל הקובץ גדול מדי (מקסימום 5MB)' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSettingChange('profile', 'avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save settings
  const handleSave = async (category = null) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Here you would typically make API calls to save settings
      // For now, we'll simulate the save process
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const categoriesToSave = category ? [category] : Object.keys(settings);
      
      // Simulate different save behaviors for different categories
      for (const cat of categoriesToSave) {
        switch (cat) {
          case 'profile':
            // Update profile via user API
            console.log('Saving profile settings:', settings.profile);
            break;
          case 'system':
            // Save system settings to backend
            console.log('Saving system settings:', settings.system);
            break;
          case 'security':
            // Save security settings
            console.log('Saving security settings:', settings.security);
            break;
          case 'notifications':
            // Save notification settings
            console.log('Saving notification settings:', settings.notifications);
            break;
          case 'data':
            // Save data settings
            console.log('Saving data settings:', settings.data);
            break;
          case 'performance':
            // Save performance settings
            console.log('Saving performance settings:', settings.performance);
            break;
        }
      }
      
      setMessage({ type: 'success', text: category ? 'הגדרות נשמרו בהצלחה!' : 'כל הגדרות נשמרו בהצלחה!' });
      setUnsavedChanges(false);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'שגיאה בשמירת ההגדרות. נסה שוב.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset settings to defaults
  const handleReset = (category) => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את ההגדרות לברירת המחדל?')) {
      // Reset logic would go here
      setMessage({ type: 'info', text: 'ההגדרות אופסו לברירת המחדל' });
      setUnsavedChanges(true);
    }
  };

  // Export data
  const handleExportData = async (format, dateRange = null) => {
    setLoading(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: `הנתונים יוצאו בפורמט ${format} בהצלחה!` });
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בייצוא הנתונים' });
    } finally {
      setLoading(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'פרופיל אישי', icon: <ProfileIcon /> },
    { id: 'system', label: 'הגדרות מערכת', icon: <SystemIcon /> },
    { id: 'security', label: 'אבטחה', icon: <SecurityIcon /> },
    { id: 'notifications', label: 'התראות', icon: <NotificationIcon /> },
    { id: 'data', label: 'נתונים וגיבוי', icon: <DataIcon /> },
    { id: 'performance', label: 'ביצועים', icon: <PerformanceIcon /> }
  ];

  if (!isAuthenticated || !user?.role?.includes('staff')) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner">⏳</div>
        <p>טוען...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings-enhanced">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-content">
          <h1 className="settings-title">הגדרות מערכת</h1>
          <p className="settings-subtitle">
            נהל את הגדרות המערכת והעדפות האישיות שלך
          </p>
        </div>
        
        {/* Global Actions */}
        <div className="settings-global-actions">
          <button
            className="settings-btn settings-btn-secondary"
            onClick={() => handleReset(activeTab)}
            disabled={loading}
          >
            <ResetIcon />
            <span>אפס</span>
          </button>
          <button
            className="settings-btn settings-btn-primary"
            onClick={() => handleSave()}
            disabled={loading || !unsavedChanges}
          >
            <SaveIcon />
            <span>{loading ? 'שומר...' : 'שמור הכל'}</span>
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`settings-message settings-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {unsavedChanges && (
        <div className="settings-warning">
          <span>⚠️ יש לך שינויים שלא נשמרו</span>
        </div>
      )}

      {/* Content Layout */}
      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="settings-nav-label">{tab.label}</span>
                <span className="settings-nav-icon">{tab.icon}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="settings-main">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">
                  <ProfileIcon />
                  פרופיל אישי
                </h2>
                <p className="settings-section-description">
                  נהל את הפרטים האישיים שלך והגדרות החשבון
                </p>
              </div>

              <div className="settings-grid">
                {/* Avatar Section */}
                <div className="settings-card">
                  <h3 className="settings-card-title">תמונת פרופיל</h3>
                  <div className="avatar-section">
                    <div className="avatar-display">
                      {settings.profile.avatar ? (
                        <img src={settings.profile.avatar} alt="Profile" className="avatar-image" />
                      ) : (
                        <div className="avatar-placeholder">
                          <ProfileIcon />
                        </div>
                      )}
                    </div>
                    <div className="avatar-actions">
                      <label className="settings-btn settings-btn-outline">
                        <UploadIcon />
                        <span>העלה תמונה</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden-input"
                        />
                      </label>
                      {settings.profile.avatar && (
                        <button
                          className="settings-btn settings-btn-danger"
                          onClick={() => handleSettingChange('profile', 'avatar', null)}
                        >
                          הסר
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="settings-card">
                  <h3 className="settings-card-title">פרטים אישיים</h3>
                  <div className="settings-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>שם פרטי</label>
                        <input
                          type="text"
                          value={settings.profile.firstName}
                          onChange={(e) => handleSettingChange('profile', 'firstName', e.target.value)}
                          className="settings-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>שם משפחה</label>
                        <input
                          type="text"
                          value={settings.profile.lastName}
                          onChange={(e) => handleSettingChange('profile', 'lastName', e.target.value)}
                          className="settings-input"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>אימייל</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                        className="settings-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>טלפון</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
                        className="settings-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="settings-card">
                  <h3 className="settings-card-title">שינוי סיסמה</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>סיסמה נוכחית</label>
                      <input
                        type="password"
                        value={settings.profile.currentPassword}
                        onChange={(e) => handleSettingChange('profile', 'currentPassword', e.target.value)}
                        className="settings-input"
                        placeholder="הכנס סיסמה נוכחית"
                      />
                    </div>
                    <div className="form-group">
                      <label>סיסמה חדשה</label>
                      <input
                        type="password"
                        value={settings.profile.newPassword}
                        onChange={(e) => handleSettingChange('profile', 'newPassword', e.target.value)}
                        className="settings-input"
                        placeholder="הכנס סיסמה חדשה"
                      />
                    </div>
                    <div className="form-group">
                      <label>אישור סיסמה חדשה</label>
                      <input
                        type="password"
                        value={settings.profile.confirmPassword}
                        onChange={(e) => handleSettingChange('profile', 'confirmPassword', e.target.value)}
                        className="settings-input"
                        placeholder="אשר סיסמה חדשה"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-actions">
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={() => handleSave('profile')}
                  disabled={loading}
                >
                  <SaveIcon />
                  <span>שמור פרופיל</span>
                </button>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">
                  <SystemIcon />
                  הגדרות מערכת
                </h2>
                <p className="settings-section-description">
                  קבע הגדרות כלליות לתפעול המערכת
                </p>
              </div>

              <div className="settings-grid">
                {/* General Settings */}
                <div className="settings-card">
                  <h3 className="settings-card-title">הגדרות כלליות</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>שם האתר</label>
                      <input
                        type="text"
                        value={settings.system.siteName}
                        onChange={(e) => handleSettingChange('system', 'siteName', e.target.value)}
                        className="settings-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>שעות פעילות</label>
                      <input
                        type="text"
                        value={settings.system.libraryHours}
                        onChange={(e) => handleSettingChange('system', 'libraryHours', e.target.value)}
                        className="settings-input"
                        placeholder="09:00-17:00"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>אזור זמן</label>
                        <select
                          value={settings.system.timeZone}
                          onChange={(e) => handleSettingChange('system', 'timeZone', e.target.value)}
                          className="settings-select"
                        >
                          <option value="Asia/Jerusalem">ירושלים</option>
                          <option value="UTC">UTC</option>
                          <option value="Europe/London">לונדון</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>שפה</label>
                        <select
                          value={settings.system.language}
                          onChange={(e) => handleSettingChange('system', 'language', e.target.value)}
                          className="settings-select"
                        >
                          <option value="he">עברית</option>
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Rules */}
                <div className="settings-card">
                  <h3 className="settings-card-title">כללי עסק</h3>
                  <div className="settings-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>מקסימום ימי השכרה</label>
                        <input
                          type="number"
                          value={settings.system.maxRentalDays}
                          onChange={(e) => handleSettingChange('system', 'maxRentalDays', parseInt(e.target.value))}
                          className="settings-input"
                          min="1"
                          max="30"
                        />
                      </div>
                      <div className="form-group">
                        <label>קנס איחור ליום (₪)</label>
                        <input
                          type="number"
                          value={settings.system.lateFeePerDay}
                          onChange={(e) => handleSettingChange('system', 'lateFeePerDay', parseFloat(e.target.value))}
                          className="settings-input"
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>זמן תפוגת סשן (שעות)</label>
                        <input
                          type="number"
                          value={settings.system.sessionTimeout}
                          onChange={(e) => handleSettingChange('system', 'sessionTimeout', parseInt(e.target.value))}
                          className="settings-input"
                          min="1"
                          max="168"
                        />
                      </div>
                      <div className="form-group">
                        <label>תפקיד ברירת מחדל</label>
                        <select
                          value={settings.system.defaultUserRole}
                          onChange={(e) => handleSettingChange('system', 'defaultUserRole', e.target.value)}
                          className="settings-select"
                        >
                          <option value="customer">לקוח</option>
                          <option value="member">חבר</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Toggles */}
                <div className="settings-card">
                  <h3 className="settings-card-title">מצבי מערכת</h3>
                  <div className="settings-toggles">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>מצב תחזוקה</label>
                        <span className="toggle-description">השבת גישה למערכת למשתמשים רגילים</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.system.maintenanceMode}
                          onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>אפשר הרשמות</label>
                        <span className="toggle-description">משתמשים חדשים יכולים להירשם למערכת</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.system.allowSignups}
                          onChange={(e) => handleSettingChange('system', 'allowSignups', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-actions">
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={() => handleSave('system')}
                  disabled={loading}
                >
                  <SaveIcon />
                  <span>שמור הגדרות מערכת</span>
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">
                  <SecurityIcon />
                  הגדרות אבטחה
                </h2>
                <p className="settings-section-description">
                  נהל הגדרות אבטחה וזיהוי פרטיות
                </p>
              </div>

              <div className="settings-grid">
                {/* Password Policy */}
                <div className="settings-card">
                  <h3 className="settings-card-title">מדיניות סיסמאות</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>אורך מינימלי לסיסמה</label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="settings-input"
                        min="6"
                        max="20"
                      />
                    </div>
                    <div className="settings-toggles">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <label>דרוש מספרים בסיסמה</label>
                        </div>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.security.requireNumbersInPassword}
                            onChange={(e) => handleSettingChange('security', 'requireNumbersInPassword', e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <label>דרוש תווים מיוחדים</label>
                        </div>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.security.requireSpecialCharsInPassword}
                            onChange={(e) => handleSettingChange('security', 'requireSpecialCharsInPassword', e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access Control */}
                <div className="settings-card">
                  <h3 className="settings-card-title">בקרת גישה</h3>
                  <div className="settings-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>מקסימום ניסיונות התחברות</label>
                        <input
                          type="number"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          className="settings-input"
                          min="3"
                          max="10"
                        />
                      </div>
                      <div className="form-group">
                        <label>זמן חסימה (דקות)</label>
                        <input
                          type="number"
                          value={settings.security.lockoutDuration}
                          onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                          className="settings-input"
                          min="5"
                          max="120"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>רשימת IP מורשים (אחד בכל שורה)</label>
                      <textarea
                        value={settings.security.ipWhitelist}
                        onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
                        className="settings-textarea"
                        placeholder="192.168.1.1&#10;10.0.0.1"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Security */}
                <div className="settings-card">
                  <h3 className="settings-card-title">אבטחה מתקדמת</h3>
                  <div className="settings-toggles">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>אימות דו-שלבי</label>
                        <span className="toggle-description">הפעל אימות דו-שלבי עבור מנהלים</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>רישום פעילות</label>
                        <span className="toggle-description">שמור יומן של כל הפעילויות במערכת</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.security.auditLogging}
                          onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>כפוי SSL</label>
                        <span className="toggle-description">הפנה תמיד לחיבור מאובטח</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.security.sslEnforced}
                          onChange={(e) => handleSettingChange('security', 'sslEnforced', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-actions">
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={() => handleSave('security')}
                  disabled={loading}
                >
                  <SaveIcon />
                  <span>שמור הגדרות אבטחה</span>
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">
                  <NotificationIcon />
                  הגדרות התראות
                </h2>
                <p className="settings-section-description">
                  נהל התראות ותבניות הודעות
                </p>
              </div>

              <div className="settings-grid">
                {/* Notification Types */}
                <div className="settings-card">
                  <h3 className="settings-card-title">סוגי התראות</h3>
                  <div className="settings-toggles">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>התראות דוא"ל</label>
                        <span className="toggle-description">שלח התראות באמצעות דוא"ל</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailEnabled}
                          onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>התראות SMS</label>
                        <span className="toggle-description">שלח התראות באמצעות הודעות טקסט</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsEnabled}
                          onChange={(e) => handleSettingChange('notifications', 'smsEnabled', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Types */}
                <div className="settings-card">
                  <h3 className="settings-card-title">סוגי התראות</h3>
                  <div className="settings-toggles">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>התראות מנהל</label>
                        <span className="toggle-description">התראות על אירועים חשובים במערכת</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.adminAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'adminAlerts', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>אישורי הזמנה</label>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderConfirmations}
                          onChange={(e) => handleSettingChange('notifications', 'orderConfirmations', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>תזכורות</label>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.reminderEmails}
                          onChange={(e) => handleSettingChange('notifications', 'reminderEmails', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>התראות איחור</label>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.overdueNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'overdueNotifications', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>התראות מלאי נמוך</label>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.lowInventoryAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'lowInventoryAlerts', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Templates */}
                <div className="settings-card">
                  <h3 className="settings-card-title">תבניות הודעות</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>הודעת ברוכים הבאים</label>
                      <textarea
                        value={settings.notifications.emailTemplates.welcome}
                        onChange={(e) => handleNestedSettingChange('notifications', 'emailTemplates', 'welcome', e.target.value)}
                        className="settings-textarea"
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>אישור הזמנה</label>
                      <textarea
                        value={settings.notifications.emailTemplates.orderConfirmation}
                        onChange={(e) => handleNestedSettingChange('notifications', 'emailTemplates', 'orderConfirmation', e.target.value)}
                        className="settings-textarea"
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>תזכורת</label>
                      <textarea
                        value={settings.notifications.emailTemplates.reminder}
                        onChange={(e) => handleNestedSettingChange('notifications', 'emailTemplates', 'reminder', e.target.value)}
                        className="settings-textarea"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-actions">
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={() => handleSave('notifications')}
                  disabled={loading}
                >
                  <SaveIcon />
                  <span>שמור הגדרות התראות</span>
                </button>
              </div>
            </div>
          )}

          {/* Data & Backup Settings */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">
                  <DataIcon />
                  נתונים וגיבוי
                </h2>
                <p className="settings-section-description">
                  נהל גיבויים, ייצוא נתונים והגדרות אחסון
                </p>
              </div>

              <div className="settings-grid">
                {/* Backup Settings */}
                <div className="settings-card">
                  <h3 className="settings-card-title">הגדרות גיבוי</h3>
                  <div className="settings-form">
                    <div className="settings-toggles">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <label>גיבוי אוטומטי</label>
                          <span className="toggle-description">בצע גיבוי אוטומטי למערכת</span>
                        </div>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.data.autoBackup}
                            onChange={(e) => handleSettingChange('data', 'autoBackup', e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                    
                    {settings.data.autoBackup && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>תדירות גיבוי</label>
                            <select
                              value={settings.data.backupFrequency}
                              onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
                              className="settings-select"
                            >
                              <option value="hourly">כל שעה</option>
                              <option value="daily">יומי</option>
                              <option value="weekly">שבועי</option>
                              <option value="monthly">חודשי</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>שמירת גיבויים (ימים)</label>
                            <input
                              type="number"
                              value={settings.data.backupRetention}
                              onChange={(e) => handleSettingChange('data', 'backupRetention', parseInt(e.target.value))}
                              className="settings-input"
                              min="7"
                              max="365"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="settings-actions">
                    <button
                      className="settings-btn settings-btn-outline"
                      onClick={() => {/* Manual backup logic */}}
                      disabled={loading}
                    >
                      גיבוי מיידי
                    </button>
                  </div>
                </div>

                {/* Data Export */}
                <div className="settings-card">
                  <h3 className="settings-card-title">ייצוא נתונים</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>פורמט ייצוא</label>
                      <select
                        value={settings.data.exportFormat}
                        onChange={(e) => handleSettingChange('data', 'exportFormat', e.target.value)}
                        className="settings-select"
                      >
                        <option value="CSV">CSV</option>
                        <option value="JSON">JSON</option>
                        <option value="Excel">Excel</option>
                        <option value="PDF">PDF</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="export-actions">
                    <button
                      className="settings-btn settings-btn-outline"
                      onClick={() => handleExportData('users')}
                      disabled={loading}
                    >
                      ייצא משתמשים
                    </button>
                    <button
                      className="settings-btn settings-btn-outline"
                      onClick={() => handleExportData('orders')}
                      disabled={loading}
                    >
                      ייצא הזמנות
                    </button>
                    <button
                      className="settings-btn settings-btn-outline"
                      onClick={() => handleExportData('products')}
                      disabled={loading}
                    >
                      ייצא מוצרים
                    </button>
                    <button
                      className="settings-btn settings-btn-outline"
                      onClick={() => handleExportData('all')}
                      disabled={loading}
                    >
                      ייצא הכל
                    </button>
                  </div>
                </div>

                {/* Data Retention */}
                <div className="settings-card">
                  <h3 className="settings-card-title">שמירת נתונים</h3>
                  <div className="settings-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>שמירת נתוני אנליטיקה (ימים)</label>
                        <input
                          type="number"
                          value={settings.data.analyticsRetention}
                          onChange={(e) => handleSettingChange('data', 'analyticsRetention', parseInt(e.target.value))}
                          className="settings-input"
                          min="30"
                          max="730"
                        />
                      </div>
                      <div className="form-group">
                        <label>שמירת יומני מערכת (ימים)</label>
                        <input
                          type="number"
                          value={settings.data.logRetention}
                          onChange={(e) => handleSettingChange('data', 'logRetention', parseInt(e.target.value))}
                          className="settings-input"
                          min="7"
                          max="90"
                        />
                      </div>
                    </div>
                    <div className="settings-toggles">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <label>דחיסת נתונים</label>
                          <span className="toggle-description">דחוס נתונים ישנים לחיסכון במקום</span>
                        </div>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.data.dataCompression}
                            onChange={(e) => handleSettingChange('data', 'dataCompression', e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-actions">
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={() => handleSave('data')}
                  disabled={loading}
                >
                  <SaveIcon />
                  <span>שמור הגדרות נתונים</span>
                </button>
              </div>
            </div>
          )}

          {/* Performance Settings */}
          {activeTab === 'performance' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">
                  <PerformanceIcon />
                  הגדרות ביצועים
                </h2>
                <p className="settings-section-description">
                  אופטימיזציה וביצועי מערכת
                </p>
              </div>

              <div className="settings-grid">
                {/* Cache Settings */}
                <div className="settings-card">
                  <h3 className="settings-card-title">הגדרות מטמון</h3>
                  <div className="settings-form">
                    <div className="settings-toggles">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <label>הפעל מטמון</label>
                          <span className="toggle-description">שפר ביצועים באמצעות מטמון</span>
                        </div>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.performance.cacheEnabled}
                            onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                    
                    {settings.performance.cacheEnabled && (
                      <div className="form-group">
                        <label>משך מטמון (שניות)</label>
                        <input
                          type="number"
                          value={settings.performance.cacheDuration}
                          onChange={(e) => handleSettingChange('performance', 'cacheDuration', parseInt(e.target.value))}
                          className="settings-input"
                          min="60"
                          max="3600"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* File & Media Settings */}
                <div className="settings-card">
                  <h3 className="settings-card-title">קבצים ומדיה</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>גודל מקסימלי לקובץ (MB)</label>
                      <input
                        type="number"
                        value={settings.performance.maxFileSize}
                        onChange={(e) => handleSettingChange('performance', 'maxFileSize', parseInt(e.target.value))}
                        className="settings-input"
                        min="1"
                        max="50"
                      />
                    </div>
                    
                    <div className="settings-toggles">
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <label>אופטימיזציית תמונות</label>
                          <span className="toggle-description">דחוס תמונות אוטומטית</span>
                        </div>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.performance.imageOptimization}
                            onChange={(e) => handleSettingChange('performance', 'imageOptimization', e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <label>טעינה עצלה</label>
                          <span className="toggle-description">טען תמונות רק כשצריך</span>
                        </div>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={settings.performance.lazyLoading}
                            onChange={(e) => handleSettingChange('performance', 'lazyLoading', e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Performance */}
                <div className="settings-card">
                  <h3 className="settings-card-title">ביצועים מתקדמים</h3>
                  <div className="settings-toggles">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>דחיסת נתונים</label>
                        <span className="toggle-description">דחוס תגובות שרת</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.performance.compressionEnabled}
                          onChange={(e) => handleSettingChange('performance', 'compressionEnabled', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <label>CDN</label>
                        <span className="toggle-description">השתמש ברשת חלוקת תוכן</span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.performance.cdnEnabled}
                          onChange={(e) => handleSettingChange('performance', 'cdnEnabled', e.target.checked)}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-actions">
                <button
                  className="settings-btn settings-btn-primary"
                  onClick={() => handleSave('performance')}
                  disabled={loading}
                >
                  <SaveIcon />
                  <span>שמור הגדרות ביצועים</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
