import React, { useState } from 'react';
import './AvailabilityDisplay.css';

// Mock availability data for testing when backend is not available
const generateMockAvailabilityData = (totalUnits = 3) => {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Create some realistic availability patterns
    let rentedUnits = 0;
    if (i === 1 || i === 2) rentedUnits = 2; // Weekend busy
    if (i === 5) rentedUnits = 1; // Partially booked
    if (i === 8 || i === 9) rentedUnits = totalUnits; // Fully booked period
    
    dates.push({
      date: dateString,
      totalUnits,
      rentedUnits,
      availableUnits: totalUnits - rentedUnits,
      isAvailable: (totalUnits - rentedUnits) > 0
    });
  }
  
  return {
    totalInventoryUnits: totalUnits,
    availabilityByDate: dates
  };
};

const AvailabilityDisplay = ({ product, availabilityData }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // Use mock data if no real data is available
  let displayData = availabilityData;
  if (!availabilityData && product) {
    displayData = generateMockAvailabilityData(product.inventory?.totalUnits || 3);
    if (!usingMockData) setUsingMockData(true);
  }

  // If no availability data, show basic inventory info
  if (!displayData) {
    const totalUnits = product?.inventory?.totalUnits || 0;
    return (
      <div className="availability-display">
        <div className={`availability-status ${totalUnits > 0 ? 'available' : 'unavailable'}`}>
          <div className="status-icon">
            {totalUnits > 0 ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            )}
          </div>
          <div className="status-text">
            <h3>{totalUnits > 0 ? 'זמין להשכרה' : 'לא זמין כרגע'}</h3>
            <p>
              {totalUnits > 0 
                ? `${totalUnits} יחידות זמינות` 
                : 'אין יחידות זמינות כרגע'}
            </p>
          </div>
        </div>
        {totalUnits > 0 && (
          <div className="availability-action">
            <p className="action-text">לחץ על "הוסף לסל" לבחירת תאריכי השכרה</p>
          </div>
        )}
      </div>
    );
  }

  const { totalInventoryUnits, availabilityByDate } = displayData;
  
  // Calculate current availability
  const today = new Date().toISOString().split('T')[0];
  const todayAvailability = availabilityByDate.find(date => date.date === today);
  const currentlyAvailable = todayAvailability ? todayAvailability.availableUnits : totalInventoryUnits;
  
  // Find next available date if currently unavailable
  const nextAvailableDate = availabilityByDate.find(date => {
    const dateObj = new Date(date.date);
    const todayObj = new Date();
    return dateObj >= todayObj && date.availableUnits > 0;
  });

  // Calculate upcoming busy periods
  const upcomingRentals = availabilityByDate
    .filter(date => {
      const dateObj = new Date(date.date);
      const todayObj = new Date();
      return dateObj >= todayObj && date.rentedUnits > 0;
    })
    .slice(0, 3);

  const isCurrentlyAvailable = currentlyAvailable > 0;

  return (
    <div className="availability-display">
      {/* Demo Mode Indicator */}
      {usingMockData && (
        <div style={{ 
          background: '#e3f2fd', 
          padding: '8px 12px', 
          borderRadius: '6px', 
          marginBottom: '16px',
          fontSize: '0.85rem',
          color: '#1976d2',
          textAlign: 'center'
        }}>
          מצב דמו - מציג נתוני זמינות לדוגמה
        </div>
      )}
      
      {/* Main Availability Status */}
      <div className={`availability-status ${isCurrentlyAvailable ? 'available' : 'unavailable'}`}>
        <div className="status-icon">
          {isCurrentlyAvailable ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5C11.2,10.5 10.5,9.8 10.5,9C10.5,8.2 11.2,7.5 12,7.5C12.8,7.5 13.5,8.2 13.5,9C13.5,9.8 12.8,10.5 12,10.5Z"/>
            </svg>
          )}
        </div>
        <div className="status-text">
          <h3>
            {isCurrentlyAvailable ? 'זמין להשכרה' : 'עסוק כרגע'}
          </h3>
          <p>
            {isCurrentlyAvailable 
              ? `${currentlyAvailable} מתוך ${totalInventoryUnits} יחידות זמינות היום`
              : 'כל היחידות מושכרות כרגע'}
          </p>
        </div>
      </div>

      {/* Next Available Date */}
      {!isCurrentlyAvailable && nextAvailableDate && (
        <div className="next-available">
          <div className="next-available-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
            </svg>
          </div>
          <div className="next-available-text">
            <h4>זמין הבא</h4>
            <p>{formatDate(nextAvailableDate.date)}</p>
            <span className="units-info">
              {nextAvailableDate.availableUnits} יחידות זמינות
            </span>
          </div>
        </div>
      )}

      {/* Quick Availability Overview */}
      {isCurrentlyAvailable && (
        <div className="quick-availability">
          <h4>זמינות קרובה</h4>
          <div className="availability-timeline">
            {getNext7Days().map(date => {
              const dayData = availabilityByDate.find(d => d.date === date);
              const available = dayData ? dayData.availableUnits : totalInventoryUnits;
              const isAvailable = available > 0;
              
              return (
                <div 
                  key={date} 
                  className={`day-indicator ${isAvailable ? 'available' : 'busy'}`}
                  title={`${formatDateShort(date)}: ${available} זמין`}
                >
                  <div className="day-name">{getDayName(date)}</div>
                  <div className="day-status">
                    {isAvailable ? (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Rentals (if any) */}
      {upcomingRentals.length > 0 && (
        <div className="upcoming-rentals">
          <button 
            className="toggle-calendar-btn"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {showCalendar ? 'הסתר פרטים' : 'הצג לוח זמנים מפורט'} 
            <span className={`arrow ${showCalendar ? 'up' : 'down'}`}>▼</span>
          </button>
          
          {showCalendar && (
            <div className="detailed-calendar">
              <h4>השכרות קרובות</h4>
              <div className="rental-periods">
                {upcomingRentals.map(date => (
                  <div key={date.date} className="rental-period">
                    <div className="date">{formatDate(date.date)}</div>
                    <div className="rental-info">
                      <span className="rented">{date.rentedUnits} מושכר</span>
                      <span className="available">{date.availableUnits} זמין</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Call-to-Action */}
      <div className="availability-action">
        {isCurrentlyAvailable ? (
          <div className="action-available">
            <p className="action-text">זמין עכשיו! לחץ "הוסף לסל" לבחירת תאריכים</p>
          </div>
        ) : (
          <div className="action-busy">
            <p className="action-text">לחץ "הוסף לסל" לבחירת תאריכים עתידיים</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};

const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short'
  });
};

const getDayName = (dateString) => {
  const date = new Date(dateString);
  const days = ['ראש', 'שני', 'שלי', 'רבי', 'חמי', 'שיש', 'שבת'];
  return days[date.getDay()];
};

const getNext7Days = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export default AvailabilityDisplay; 