import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RentalDatePickerModal.css"; // Optional: create this file for custom styles

// Make sure to bind modal to your appElement (for accessibility)
Modal.setAppElement("#root");

const RentalDatePickerModal = ({ isOpen, onRequestClose, onConfirm }) => {
  // States for start and end dates
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Filter function: allow only Sundays (0), Tuesdays (2), and Thursdays (4)
  const filterDates = (date) => {
    const day = date.getDay();
    return day === 0 || day === 2 || day === 4;
  };

  // Handler for confirming the rental dates
  const handleConfirm = () => {
    if (startDate && endDate && endDate > startDate) {
      onConfirm({ startDate, endDate });
      onRequestClose(); // Close the modal after confirming
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
      <div className="date-picker-group">
        <div className="date-picker-item">
          <label>תאריך התחלה:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            filterDate={filterDates}
            placeholderText="בחר תאריך התחלה"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div className="date-picker-item">
          <label>תאריך סיום:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            filterDate={filterDates}
            placeholderText="בחר תאריך סיום"
            dateFormat="dd/MM/yyyy"
            minDate={startDate}
          />
        </div>
      </div>
      <div className="modal-buttons">
        <button onClick={handleConfirm} className="confirm-button">
          אישור
        </button>
        <button onClick={onRequestClose} className="cancel-button">
          ביטול
        </button>
      </div>
    </Modal>
  );
};

export default RentalDatePickerModal;
