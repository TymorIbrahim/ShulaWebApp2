import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./EditRentalModal.css";

// Bind modal for accessibility
Modal.setAppElement("#root");

const EditRentalModal = ({ isOpen, onRequestClose, currentRentalPeriod, currentQuantity = 1, onSave, availableUnits = 1 }) => {
  // Initialize with current rental period values (if provided)
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [quantity, setQuantity] = useState(currentQuantity);

  useEffect(() => {
    if (currentRentalPeriod) {
      setDateRange([
        new Date(currentRentalPeriod.startDate),
        new Date(currentRentalPeriod.endDate)
      ]);
    }
    setQuantity(currentQuantity || 1);
  }, [currentRentalPeriod, currentQuantity]);

  // Allow only allowed days: Sunday, Tuesday, Thursday
  const filterDates = (date) => {
    const day = date.getDay();
    return day === 0 || day === 2 || day === 4;
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

  const handleSave = () => {
    if (startDate && endDate && endDate > startDate) {
      onSave({ startDate, endDate, quantity });
      onRequestClose();
    } else {
      alert("בחר תאריכים חוקיים (תאריך סיום אחרי תאריך התחלה)!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="ערוך פרטי השכרה"
      className="CenteredModal"
      overlayClassName="CenteredOverlay"
    >
      <h2>ערוך פרטי השכרה</h2>
      
      {/* Quantity selector */}
      {availableUnits > 1 && (
        <div className="quantity-selector">
          <label>כמות יחידות:</label>
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
      <div className="modal-buttons">
        <button onClick={handleSave} className="save-button">
          שמור שינויים
        </button>
        <button onClick={onRequestClose} className="cancel-button">
          ביטול
        </button>
      </div>
    </Modal>
  );
};

export default EditRentalModal;
