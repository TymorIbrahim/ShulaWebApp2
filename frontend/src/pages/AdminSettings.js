import React, { useState } from 'react';
import './AdminSettings.css'; // Make sure you import the updated CSS!

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    fullName: "שם מלא", // You can replace with real data later
    email: "admin@example.com",
    maxRentalDays: 7,
    lateFeePerDay: 5,
    notificationsEnabled: true,
    theme: 'light',
    libraryHours: '17:00 - 19:00',
    autoRestockAlerts: true,
    lowInventoryWarnings: false,
    exportDataFormat: 'CSV',
  });

  const user = { role: 'admin' };
  if (!user || user.role !== 'admin') {
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Access denied. Admins only.</div>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Settings saved:', settings);
    alert('הגדרות נשמרו (דמה)');
  };

  return (
    <div className="admin-settings-container">
      <h1>הגדרות ניהול</h1>

      <form onSubmit={handleSubmit} className="admin-settings-form">

        {/* --- Profile Section --- */}
        <section className="settings-card">
          <h2 className="settings-section-title">👤 פרופיל</h2>
          <div className="form-group">
            <label>שם מלא:</label>
            <input type="text" value={settings.fullName} className="settings-input view-only" disabled />
          </div>
          <div className="form-group">
            <label>אימייל:</label>
            <input type="email" value={settings.email} className="settings-input view-only" disabled />
          </div>
          <div className="form-group">
            <input type="password" placeholder="סיסמה חדשה" className="settings-input" disabled />
          </div>
          <div className="form-group">
            <input type="password" placeholder="סיסמה נוכחית" className="settings-input" disabled />
          </div>
        </section>

        {/* --- System Settings --- */}
        <section className="settings-card">
          <h2 className="settings-section-title">⚙️ הגדרות מערכת</h2>
          <div className="form-group">
            <label>שעות פעילות:</label>
            <input
              name="libraryHours"
              value={settings.libraryHours}
              onChange={handleChange}
              className="settings-input"
            />
          </div>
          <div className="form-group">
            <label>מספר ימי השכרה מרביים:</label>
            <input
              type="number"
              name="maxRentalDays"
              value={settings.maxRentalDays}
              onChange={handleChange}
              className="settings-input"
              min="1"
            />
          </div>
          <div className="form-group">
            <label>קנס איחור ליום (₪):</label>
            <input
              type="number"
              name="lateFeePerDay"
              value={settings.lateFeePerDay}
              onChange={handleChange}
              className="settings-input"
              min="0"
              step="0.5"
            />
          </div>
        </section>

        {/* --- User Management --- */}
        <section className="settings-card">
          <h2 className="settings-section-title">👥 ניהול משתמשים</h2>
          <p>ניהול משתמשים יתבצע דרך ממשק ניהול נפרד (לא מיושם בדף זה).</p>
        </section>

        {/* --- Inventory Preferences --- */}
        <section className="settings-card">
          <h2 className="settings-section-title">📦 העדפות מלאי</h2>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              name="autoRestockAlerts"
              checked={settings.autoRestockAlerts}
              onChange={handleChange}
            />
            התראות חידוש מלאי
          </label>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              name="lowInventoryWarnings"
              checked={settings.lowInventoryWarnings}
              onChange={handleChange}
            />
            התראות על מלאי נמוך
          </label>
        </section>

        {/* --- Notifications --- */}
        <section className="settings-card">
          <h2 className="settings-section-title">🔔 התראות</h2>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={settings.notificationsEnabled}
              onChange={handleChange}
            />
            הפעל התראות בדוא"ל
          </label>
        </section>

        {/* --- Backup & Export --- */}
        <section className="settings-card">
          <h2 className="settings-section-title">💾 גיבוי וייצוא</h2>
          <div className="form-group">
            <label>פורמט ייצוא נתונים:</label>
            <select
              name="exportDataFormat"
              value={settings.exportDataFormat}
              onChange={handleChange}
              className="settings-input"
            >
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
            </select>
          </div>
          <div className="settings-button-group">
            <button type="button" className="button settings-button" disabled>ייצוא נתונים</button>
            <button type="button" className="button settings-button" disabled>גיבוי ידני</button>
          </div>
        </section>

        {/* --- Save Button --- */}
        <button type="submit" className="button button-primary settings-button save">
          שמור הגדרות
        </button>

      </form>
    </div>
  );
};

export default AdminSettings;
