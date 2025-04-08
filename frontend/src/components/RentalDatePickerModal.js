import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RentalDatePickerModal.css";

// Bind modal to the app root
Modal.setAppElement("#root");

const RentalDatePickerModal = ({ isOpen, onRequestClose, onConfirm }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const filterDates = (date) => {
    const day = date.getDay();
    return day === 0 || day === 2 || day === 4;
  };

  const handleReset = () => {
    setDateRange([null, null]);
  };

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
  className="CenteredModal"
  overlayClassName="CenteredOverlay"
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
