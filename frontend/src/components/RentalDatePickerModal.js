import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RentalDatePickerModal.css";

// Bind modal for accessibility
Modal.setAppElement("#root");

const RentalDatePickerModal = ({ isOpen, onRequestClose, onConfirm }) => {
  // Use a single state array for range selection [start, end]
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Only allow Sundays (0), Tuesdays (2), and Thursdays (4)
  const filterDates = (date) => {
    const day = date.getDay();
    return day === 0 || day === 2 || day === 4;
  };

  // Filter out null values before highlighting dates
  const highlightedDates = dateRange.filter((date) => date);

  // Reset the date selection
  const handleReset = () => {
    setDateRange([null, null]);
  };

  // Confirm the selected rental period
  const handleConfirm = () => {
    if (startDate && endDate && endDate > startDate) {
      onConfirm({ startDate, endDate });
      onRequestClose();
    } else {
      alert("בחר תאריכים חוקיים (תאריך סיום אחרי תאריך התחלה)!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="בחר תאריכי השכרה"
      className="rental-modal"
      overlayClassName="rental-modal-overlay"
    >
      <h2>בחר תאריכי השכרה</h2>
      <p className="calendar-instructions">
        לחץ על תאריך התחלה ובחר/גרור לתאריך סיום. ימים זמינים: ראשון, שלישי, חמישי.
      </p>
      <div className="date-picker-container">
        <DatePicker
          selected={startDate}
          onChange={(update) => setDateRange(update)}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          filterDate={filterDates}
          highlightDates={highlightedDates}
          calendarClassName="custom-calendar"
        />
      </div>
      <div className="date-picker-legend">
        <span className="legend-available">●</span> תאריכים זמינים
      </div>
      <div className="modal-buttons">
        <button onClick={handleConfirm} className="confirm-button">
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
