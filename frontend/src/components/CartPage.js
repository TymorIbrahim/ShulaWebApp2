// src/components/CartPage.js
import React from 'react';
import './CartPage.css'; // Create and import CSS file
import cartBanner from '../assets/cart-banner.jpg'; // Adjust path if needed
import { useCart } from '../context/CartContext'; 

const CartPage = () => {
  // Get cart items and potentially remove function from context
  const { cartItems /*, removeFromCart */ } = useCart(); 

  // Calculate Total 
  const total = cartItems.reduce((acc, item) => {
      // Use item.price directly if quantity is not implemented
      return acc + (item.price || 0); 
      // If quantity implemented: return acc + (item.price || 0) * (item.quantity || 1);
  }, 0);

  return (
    <div className="cart-page">
      <h1 className="cart-title">🛒 העגלה שלי</h1>
      <div className="cart-image-container">
        <img src={cartBanner} alt="Cart banner" className="cart-banner" />
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-cart-message">העגלה שלך ריקה.</p> 
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              // Use item.id (which was mapped from _id in CartContext)
              <div key={item.id} className="cart-item"> 
                 {/* Optional: Display image */}
                 {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                 )}
                <div className="item-info">
                  <h3>{item.name || 'Item Name'}</h3>
                  {/* Add quantity display if implemented in CartContext */}
                  {/* {item.quantity && <p>כמות: {item.quantity}</p>} */} 
                  <p>מחיר: ₪{item.price ?? 'N/A'}</p>
                   {/* Add rental dates display if implemented in CartContext */}
                   {/* {item.rentalStartDate && item.rentalEndDate && (
                       <p>תאריכים: {item.rentalStartDate.toLocaleDateString()} - {item.rentalEndDate.toLocaleDateString()}</p>
                   )} */}
                </div>
                <div className="item-total">
                  ₪{item.price ?? 0} 
                  {/* If quantity implemented: ₪{(item.price || 0) * (item.quantity || 1)} */}
                </div>
                {/* Add a "Remove" button here - requires removeFromCart in context */}
                {/* <button 
                    className="remove-button" 
                    onClick={() => removeFromCart(item.id)}
                 >
                    הסר
                 </button> */}
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>סה"כ (לתשלום סמלי): ₪{total}</h2> 
            {/* This button would likely trigger a checkout process */}
            <button className="book-button">📦 הזמן את הפריטים</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;