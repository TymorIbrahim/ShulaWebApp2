import React from 'react';
import './CartPage.css'; // We’ll add this file next
import cartBanner from '../assets/cart-banner.jpg'; // import the image


const CartPage = () => {
  // Fake cart items for now (you’ll replace with real data later)
  const cartItems = [
    { id: 1, name: 'כיסאות מתקפלים', price: 20, quantity: 2 },
    { id: 2, name: 'שולחן פיקניק', price: 35, quantity: 1 },
  ];

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h1 className="cart-title">🛒 העגלה שלי</h1>
      <div className="cart-image-container">
    <img src={cartBanner} alt="Cart banner" className="cart-banner" />
  </div>

      {cartItems.length === 0 ? (
        <p>העגלה שלך ריקה.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>כמות: {item.quantity}</p>
                  <p>מחיר: ₪{item.price}</p>
                </div>
                <div className="item-total">
                  ₪{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>סה"כ: ₪{total}</h2>
            <button className="book-button">📦 הזמן את הפריטים</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
