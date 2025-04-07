import React from 'react';
import Modal from 'react-modal';
import "./ChoiceModal.css";

// Bind modal for accessibility
Modal.setAppElement("#root");

const ChoiceModal = ({ isOpen, onClose, onViewCart, onContinueShopping }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="בחירת פעולה"
      className="choice-modal"
      overlayClassName="choice-modal-overlay"
    >
      <h2>בחר פעולה</h2>
      <p>מה ברצונך לעשות עכשיו?</p>
      <div className="choice-buttons">
        <button className="view-cart-button" onClick={onViewCart}>הצג עגלה</button>
        <button className="continue-button" onClick={onContinueShopping}>המשך קניות</button>
      </div>
    </Modal>
  );
};

export default ChoiceModal;
