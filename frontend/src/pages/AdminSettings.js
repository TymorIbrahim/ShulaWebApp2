import React, { useState } from 'react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
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
    return <div>Access denied. Admins only.</div>;
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
    console.log('Mock saved settings:', settings);
    alert('Settings saved (mock)');
  };

  return (
    <div style={{ padding: '100px 1rem 2rem', maxWidth: '850px', margin: '0 auto', fontFamily: 'Heebo, sans-serif', backgroundColor: '#f5f7fa', borderRadius: '12px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', color: '#2c3e50' }}>הגדרות ניהול</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Profile Settings */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>פרופיל</h2>
          <input placeholder="שם מלא" style={inputStyle} />
          <input placeholder="אימייל" style={inputStyle} />
          <input type="password" placeholder="סיסמה חדשה" style={inputStyle} />
          <input type="password" placeholder="סיסמה נוכחית" style={inputStyle} />
        </section>

        {/* System Settings */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>הגדרות מערכת</h2>
          <input
            name="libraryHours"
            value={settings.libraryHours}
            onChange={handleChange}
            style={inputStyle}
            placeholder="שעות פעילות"
          />
          <input
            type="number"
            name="maxRentalDays"
            value={settings.maxRentalDays}
            onChange={handleChange}
            style={inputStyle}
            placeholder="מספר ימי השכרה מרביים"
          />
          <input
            type="number"
            name="lateFeePerDay"
            value={settings.lateFeePerDay}
            onChange={handleChange}
            style={inputStyle}
            placeholder="קנס איחור ליום (₪)"
          />
        </section>

        {/* User Management */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>ניהול משתמשים</h2>
          <div style={buttonGroupStyle}>
            <button type="button" style={buttonStyle}>קידום משתמש</button>
            <button type="button" style={buttonStyle}>הורדת משתמש</button>
            <button type="button" style={buttonStyle}>השבתת משתמש</button>
            <button type="button" style={{ ...buttonStyle, backgroundColor: '#e74c3c', color: '#fff' }}>מחיקת משתמש</button>
          </div>
        </section>

        {/* Inventory Preferences */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>העדפות מלאי</h2>
          <label style={checkboxStyle}><input type="checkbox" name="autoRestockAlerts" checked={settings.autoRestockAlerts} onChange={handleChange} /> התראות חידוש מלאי</label>
          <label style={checkboxStyle}><input type="checkbox" name="lowInventoryWarnings" checked={settings.lowInventoryWarnings} onChange={handleChange} /> התראות על מלאי נמוך</label>
        </section>

        {/* Notifications */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>התראות</h2>
          <label style={checkboxStyle}><input type="checkbox" name="notificationsEnabled" checked={settings.notificationsEnabled} onChange={handleChange} /> הפעל התראות בדוא"ל</label>
        </section>

        {/* Backup & Export */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>גיבוי וייצוא</h2>
          <select name="exportDataFormat" value={settings.exportDataFormat} onChange={handleChange} style={inputStyle}>
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
          </select>
          <div style={buttonGroupStyle}>
            <button type="button" style={buttonStyle}>ייצוא נתונים</button>
            <button type="button" style={buttonStyle}>גיבוי ידני</button>
          </div>
        </section>

        <button type="submit" style={{ ...buttonStyle, backgroundColor: '#3498db', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>שמור הגדרות</button>
      </form>
    </div>
  );
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
};

const sectionTitleStyle = {
  fontSize: '1.5rem',
  marginBottom: '1.2rem',
  color: '#2c3e50',
};

const inputStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  marginBottom: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  width: '100%',
  backgroundColor: '#fdfdfd',
};

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  fontSize: '1rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  backgroundColor: '#bdc3c7',
  marginTop: '0.5rem',
  marginRight: '0.5rem',
  transition: '0.3s ease',
};

const buttonGroupStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '1rem',
};

const checkboxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '1rem',
  marginBottom: '0.75rem',
};

export default AdminSettings;
