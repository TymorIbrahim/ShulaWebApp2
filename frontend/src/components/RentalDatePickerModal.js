// src/components/RentalDatePickerModal.js
import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RentalDatePickerModal.css"; // Optional: create this file for custom styles

// Ensure Modal is bound to your app element for accessibility
// This should ideally be done once, perhaps in index.js or App.js
// If it's not already done elsewhere, keep it here for now.
if (Modal.defaultStyles.content && document.getElementById('root')) {
    Modal.setAppElement("#root");
} else {
    console.warn("Modal app element not set. Ensure #root exists or set manually.");
}


const RentalDatePickerModal = ({ isOpen, onRequestClose, onConfirm, bookedDates }) => {
  // Use a state array for range selection [start, end]
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Allow only Sundays (0), Tuesdays (2), and Thursdays (4)
  const filterDates = (date) => {
    const day = date.getDay();
    return day === 0 || day === 2 || day === 4; // Example filter
    // Or return true; // To allow all dates
  };

  // Handler for confirming the rental dates
  const handleConfirm = () => {
    // Log when called for debugging
    console.log("RentalModal: handleConfirm called. Start:", startDate, "End:", endDate); 

    // Validate dates
    if (startDate && endDate && endDate > startDate) {
      console.log("RentalModal: Dates ARE valid, calling onConfirm prop."); 
      // Call the onConfirm function passed from parent with selected dates
      onConfirm({ startDate, endDate }); 
      // Optionally close modal here or let parent handle it via onRequestClose prop
      // onRequestClose(); // You might want parent (ProductDetails) to close it after addToCart succeeds
    } else {
      console.log("RentalModal: Dates ARE INVALID."); 
      alert("בחר תאריכים חוקיים (תאריך סיום אחרי תאריך התחלה)!");
    }
  };

  // Handle changes to start date - potentially reset end date if invalid
  const handleStartDateChange = (date) => {
      setStartDate(date);
      if (endDate && date && endDate <= date) {
          setEndDate(null); // Reset end date if it's no longer valid
      }
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose} // Function to close modal (e.g., clicking overlay, ESC)
      contentLabel="בחר תאריכי השכרה"
      className="rental-modal" // Class for modal content styling
      overlayClassName="rental-modal-overlay" // Class for overlay styling
    >
      <h2>בחר תאריכי השכרה</h2>
      <div className="date-picker-group">
        <div className="date-picker-item">
          <label>תאריך התחלה:</label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange} // Use updated handler
            selectsStart
            startDate={startDate}
            endDate={endDate}
            filterDate={filterDates} // Apply date filter
            minDate={new Date()} // Prevent selecting past dates
            placeholderText="בחר תאריך התחלה"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div className="date-picker-item">
          <label>תאריך סיום:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            filterDate={filterDates} // Apply date filter
            minDate={startDate || new Date()} // End date must be after start date (or today)
            placeholderText="בחר תאריך סיום"
            dateFormat="dd/MM/yyyy"
            disabled={!startDate} // Disable until start date is selected
          />
        </div>
      </div>
      <div className="modal-buttons">
        {/* Button calls internal handleConfirm function */}
        <button onClick={handleConfirm} className="confirm-button">
          אישור
        </button>
        {/* Button calls the close function passed from parent */}
        <button onClick={onRequestClose} className="cancel-button">
          ביטול
        </button>
      </div>
    </Modal>
  );
};

export default RentalDatePickerModal;