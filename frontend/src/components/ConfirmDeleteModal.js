import React from "react";
import Modal from "react-modal";
import "./ConfirmDeleteModal.css";

// Bind modal for accessibility
Modal.setAppElement("#root");

const ConfirmDeleteModal = ({ isOpen, onRequestClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="אישור מחיקה"
      className="delete-modal"
      overlayClassName="delete-modal-overlay"
    >
      <h2>אישור מחיקה</h2>
      <p>האם אתה בטוח שברצונך למחוק פריט זה?</p>
      <div className="delete-actions">
        <button className="confirm-delete-btn" onClick={onConfirm}>
          מחק
        </button>
        <button className="cancel-delete-btn" onClick={onRequestClose}>
          ביטול
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
