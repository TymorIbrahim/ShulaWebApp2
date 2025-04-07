import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./EditRentalModal.css";

// Bind modal for accessibility
Modal.setAppElement("#root");

const EditRentalModal = ({ isOpen, onRequestClose, currentRentalPeriod, onSave }) => {
  // Initialize with current rental period values (if provided)
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    if (currentRentalPeriod) {
      setDateRange([
        new Date(currentRentalPeriod.startDate),
        new Date(currentRentalPeriod.endDate)
      ]);
    }
  }, [currentRentalPeriod]);

  // Allow only allowed days: Sunday, Tuesday, Thursday
  const filterDates = (date) => {
    const day = date.getDay();
    return day === 0 || day === 2 || day === 4;
  };

  const handleSave = () => {
    if (startDate && endDate && endDate > startDate) {
      onSave({ startDate, endDate });
      onRequestClose();
    } else {
      alert("בחר תאריכים חוקיים (תאריך סיום אחרי תאריך התחלה)!");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="עריכת תאריכי השכרה"
      className="edit-modal"
      overlayClassName="edit-modal-overlay"
    >
      <h2>עריכת תאריכי השכרה</h2>
      <p className="instructions">
        אנא בחר את תאריך ההתחלה ותאריך הסיום להשכרה. <br />
        השכרה מתבצעת ב-48 שעות בלבד, ותוכל לבחור רק ימים זמינים: ראשון, שלישי וחמישי.
      </p>
      <div className="current-rental">
        <p>
          <strong>תאריך התחלה:</strong>{" "}
          {startDate ? startDate.toLocaleDateString() : "לא נבחר"}
        </p>
        <p>
          <strong>תאריך סיום:</strong>{" "}
          {endDate ? endDate.toLocaleDateString() : "לא נבחר"}
        </p>
      </div>
      <div className="date-picker-wrapper">
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
      <div className="modal-actions">
        <button className="save-btn" onClick={handleSave}>שמור</button>
        <button className="cancel-btn" onClick={onRequestClose}>ביטול</button>
      </div>
    </Modal>
  );
};

export default EditRentalModal;
