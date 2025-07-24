// C:\Users\User\ShulaWebApp2\frontend\src\components\RentalDatePickerModal.js
import React, { useState, useEffect } from "react"; // Import useEffect
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RentalDatePickerModal.css";

// Bind modal to the app root
Modal.setAppElement("#root");

// --- Helper Function for Price Calculation ---
// Moved outside the component for clarity, or can be kept inside if preferred
const calculatePriceForPeriod = (start, end, basePrice, quantity = 1) => {
    // Return null if dates are invalid, incomplete, or no base price
    if (!start || !end || end <= start || !basePrice) {
        return null;
    }

    // Calculate difference in milliseconds, then hours
    const milliseconds = end.getTime() - start.getTime();
    const hours = milliseconds / (1000 * 60 * 60);

    // Calculate periods (minimum 1 period of 48 hours)
    let periods = Math.max(1, Math.ceil(hours / 48));

    // Specific business logic: Deduct a period if the end date is a Sunday (Day 0)
    // Make sure this logic is exactly what you need.
    if (end.getDay() === 0 || (end.getDay()===0 && start.getDay()===4) || (end.getDay()===4 && start.getDay()===4) || start.getDay() ) {
        periods = Math.max(1, periods - 1); // Ensure price doesn't go below 1 period
    }

    const total = periods * basePrice * quantity;
    // console.log(`Hours: ${hours.toFixed(2)}, Periods: ${periods}, Base: ${basePrice}, Quantity: ${quantity}, Total: ${total.toFixed(2)}`); // For debugging
    return total;
};
// --- End Helper Function ---


// Receive productPrice and availableUnits props
const RentalDatePickerModal = ({ isOpen, onRequestClose, onConfirm, bookedDates, productPrice, availableUnits = 1 }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [quantity, setQuantity] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(null); // State for calculated price

  // Recalculate price whenever dateRange, productPrice, or quantity changes
  useEffect(() => {
    const price = calculatePriceForPeriod(startDate, endDate, productPrice, quantity);
    setCalculatedPrice(price);
  }, [startDate, endDate, productPrice, quantity]); // Dependencies: run when these change


  const filterDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const isAvailableDay = day === 0 || day === 2 || day === 4;
    const isPast = date < today;
    const dateString = date.toISOString().split('T')[0];
    const isBooked = bookedDates.includes(dateString);
    return isAvailableDay && !isPast && !isBooked;
  };

  const handleReset = () => {
    setDateRange([null, null]);
    setQuantity(1);
    // Optionally reset calculated price too: setCalculatedPrice(null);
  };

  const handleConfirm = () => {
    if (startDate && endDate && endDate > startDate) {
      onConfirm({ startDate, endDate, quantity }); // Pass dates and quantity back
      onRequestClose();
    } else {
      alert("בחר תאריכים חוקיים (תאריך סיום אחרי תאריך התחלה)!");
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(value, availableUnits)));
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, availableUnits));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="בחר תאריכי השכרה"
      className="CenteredModal"
      overlayClassName="CenteredOverlay"
    >
      <h2>בחר תאריכי השכרה וכמות</h2>
      <p className="calendar-instructions">
        לחץ על תאריך התחלה ובחר/גרור לתאריך סיום. ימים זמינים: ראשון, שלישי, חמישי.
      </p>
      {/* Display the base price */}
      <p align="center">( מחיר ל-48 שעות : ₪{productPrice?.toFixed(2) ?? 'N/A'})</p>

      {/* Quantity selector */}
      {availableUnits > 1 && (
        <div className="quantity-selector">
          <label>כמות יחידות להשכרה:</label>
          <div className="quantity-controls">
            <button 
              type="button" 
              className="quantity-btn" 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max={availableUnits}
              className="quantity-input"
            />
            <button 
              type="button" 
              className="quantity-btn" 
              onClick={incrementQuantity}
              disabled={quantity >= availableUnits}
            >
              +
            </button>
          </div>
          <span className="available-units-text">
            (זמין: {availableUnits} יחידות)
          </span>
        </div>
      )}

      {/* --- Display Calculated Price --- */}
      {calculatedPrice !== null && ( // Only show if a valid price is calculated
        <div className="calculated-price-display">
            <p align="center">
              מחיר לתקופה שנבחרה: <strong>₪{calculatedPrice.toFixed(2)}</strong>
              {quantity > 1 && <span> ({quantity} יחידות)</span>}
            </p>
        </div>
      )}
      {/* --- End Display Calculated Price --- */}

      <div className="date-picker-container">
        <DatePicker
          selected={startDate}
          onChange={(update) => setDateRange(update)}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          filterDate={filterDates}
          calendarClassName="custom-calendar"
        />
      </div>

      


      <div className="date-picker-legend">
        <span className="legend-available">●</span> תאריכים זמינים
      </div>
      <div className="modal-buttons">
        <button onClick={handleConfirm} className="confirm-button" disabled={!startDate || !endDate || endDate <= startDate}> {/* Disable confirm if dates invalid */}
          אישור
        </button>
        <button onClick={handleReset} className="reset-button">
          איפוס בחירה
        </button>
        <button onClick={onRequestClose} className="cancel-button">
          ביטול
        </button>
      </div>
    </Modal>
  );
};

export default RentalDatePickerModal;