import React, { useState } from 'react';
import './AdminSettings.css'; // Import the new CSS file

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    maxRentalDays: 7,
    lateFeePerDay: 5,
    notificationsEnabled: true,
    theme: 'light', // Theme might not be directly used in inputs shown
    libraryHours: '17:00 - 19:00',
    autoRestockAlerts: true,
    lowInventoryWarnings: false,
    exportDataFormat: 'CSV',
  });

  // --- Mock User Check (Keep or replace with actual context) ---
  // In a real app, you'd use useAuth() here
  const user = { role: 'staff' };
  if (!user || user.role !== 'staff') {
    // Or redirect using Navigate component from react-router-dom
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Access denied. Admins only.</div>;
  }
  // --- End Mock User Check ---

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with actual API call to save settings
    console.log('Mock saved settings:', settings);
    alert('Settings saved (mock)');
  };

  return (
    // Use CSS classes instead of inline styles
    <div className="admin-settings-container">
      <h1>הגדרות ניהול</h1>

      <form onSubmit={handleSubmit} className="admin-settings-form">

        {/* Profile Settings - Example - Needs state/logic */}
        <section className="settings-card">
          <h2 className="settings-section-title">פרופיל</h2>
          {/* TODO: Add state and handlers for profile fields */}
          <input placeholder="שם מלא" className="settings-input" disabled />
          <input placeholder="אימייל" className="settings-input" disabled />
          <input type="password" placeholder="סיסמה חדשה" className="settings-input" disabled />
          <input type="password" placeholder="סיסמה נוכחית" className="settings-input" disabled />
        </section>

        {/* System Settings */}
        <section className="settings-card">
          <h2 className="settings-section-title">הגדרות מערכת</h2>
          <label htmlFor="libraryHours">שעות פעילות:</label>
          <input
            id="libraryHours"
            name="libraryHours"
            value={settings.libraryHours}
            onChange={handleChange}
            className="settings-input"
            placeholder="שעות פעילות"
          />
          <label htmlFor="maxRentalDays">מספר ימי השכרה מרביים:</label>
          <input
            id="maxRentalDays"
            type="number"
            name="maxRentalDays"
            value={settings.maxRentalDays}
            onChange={handleChange}
            className="settings-input"
            placeholder="מספר ימי השכרה מרביים"
            min="1"
          />
          <label htmlFor="lateFeePerDay">קנס איחור ליום (₪):</label>
          <input
            id="lateFeePerDay"
            type="number"
            name="lateFeePerDay"
            value={settings.lateFeePerDay}
            onChange={handleChange}
            className="settings-input"
            placeholder="קנס איחור ליום (₪)"
            min="0"
            step="0.5"
          />
        </section>

        {/* User Management - Example - Needs state/logic */}
        <section className="settings-card">
          <h2 className="settings-section-title">ניהול משתמשים</h2>
          <p>ניהול משתמשים יתבצע דרך ממשק ניהול נפרד (לא מיושם בדף זה).</p>
          {/* <div className="settings-button-group">
            <button type="button" className="button settings-button" disabled>קידום משתמש</button>
            <button type="button" className="button settings-button" disabled>הורדת משתמש</button>
            <button type="button" className="button settings-button" disabled>השבתת משתמש</button>
            <button type="button" className="button delete-button settings-button" disabled>מחיקת משתמש</button>
          </div> */}
        </section>

        {/* Inventory Preferences */}
        <section className="settings-card">
          <h2 className="settings-section-title">העדפות מלאי</h2>
          <label className="settings-checkbox-label">
              <input type="checkbox" name="autoRestockAlerts" checked={settings.autoRestockAlerts} onChange={handleChange} /> התראות חידוש מלאי
          </label>
          <label className="settings-checkbox-label">
              <input type="checkbox" name="lowInventoryWarnings" checked={settings.lowInventoryWarnings} onChange={handleChange} /> התראות על מלאי נמוך
          </label>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <h2 className="settings-section-title">התראות</h2>
          <label className="settings-checkbox-label">
            <input type="checkbox" name="notificationsEnabled" checked={settings.notificationsEnabled} onChange={handleChange} /> הפעל התראות בדוא"ל
          </label>
        </section>

        {/* Backup & Export */}
        <section className="settings-card">
          <h2 className="settings-section-title">גיבוי וייצוא</h2>
          <label htmlFor="exportDataFormat">פורמט ייצוא נתונים:</label>
          <select id="exportDataFormat" name="exportDataFormat" value={settings.exportDataFormat} onChange={handleChange} className="settings-input">
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
          </select>
          <div className="settings-button-group">
             {/* TODO: Add actual export/backup functionality */}
            <button type="button" className="button settings-button" disabled>ייצוא נתונים</button>
            <button type="button" className="button settings-button" disabled>גיבוי ידני</button>
          </div>
        </section>

        <button type="submit" className="button button-primary settings-button save">שמור הגדרות</button>
      </form>
    </div>
  );
};

export default AdminSettings;