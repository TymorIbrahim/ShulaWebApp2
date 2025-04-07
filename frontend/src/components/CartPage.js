import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CartPage.css";
import cartBanner from "../assets/cart-banner.jpg";
import EditRentalModal from "./EditRentalModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const CartPage = ({ user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal controls
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);

  const userId = user?._id;

  // Fetch cart items for the user
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5002/api/carts/${userId}`);
      setCartItems(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching cart items");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  // Open edit modal for a cart item
  const openEditModal = (item) => {
    setSelectedCartItem(item);
    setEditModalOpen(true);
  };

  // Open delete modal for a cart item
  const openDeleteModal = (item) => {
    setSelectedCartItem(item);
    setDeleteModalOpen(true);
  };

  // Delete a cart item
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5002/api/carts/${selectedCartItem._id}`);
      setDeleteModalOpen(false);
      setSelectedCartItem(null);
      fetchCartItems();
    } catch (err) {
      console.error(err);
      setError("Failed to delete item");
      setDeleteModalOpen(false);
    }
  };

  // Update a cart item with new rental dates
  const handleUpdate = async (newDates) => {
    try {
      await axios.put(`http://localhost:5002/api/carts/${selectedCartItem._id}`, {
        rentalPeriod: newDates
      });
      setEditModalOpen(false);
      setSelectedCartItem(null);
      fetchCartItems();
    } catch (err) {
      console.error(err);
      setError("Failed to update item");
      setEditModalOpen(false);
    }
  };

  // Checkout: move cart items to orders and clear the cart
  const handleCheckout = async () => {
    try {
      const response = await axios.post("http://localhost:5002/api/carts/checkout", { user: userId });
      alert("Checkout successful!");
      fetchCartItems();
    } catch (err) {
      console.error(err);
      setError("Checkout failed");
    }
  };

  // Calculate total price (assuming product.price exists)
  const total = cartItems.reduce((acc, item) => acc + (item.product.price || 0), 0);

  if (loading) {
    return <p className="loading">טוען עגלה...</p>;
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <img src={cartBanner} alt="Cart banner" className="cart-banner" />
        <h1 className="cart-title">🛒 העגלה שלי</h1>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {cartItems.length === 0 ? (
        <p className="empty-cart">העגלה שלך ריקה.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <div className="item-info">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-dates">
                    השכרה:{" "}
                    {new Date(item.rentalPeriod.startDate).toLocaleDateString()} -{" "}
                    {new Date(item.rentalPeriod.endDate).toLocaleDateString()}
                  </p>
                  <p className="rental-info">
                    השכרה מתבצעת ב-48 שעות בלבד, ניתן לבחור רק ימים: ראשון, שלישי וחמישי.
                  </p>
                </div>
                <div className="item-actions">
                  <button className="action-btn edit-btn" onClick={() => openEditModal(item)}>
                    ערוך
                  </button>
                  <button className="action-btn delete-btn" onClick={() => openDeleteModal(item)}>
                    מחק
                  </button>
                </div>
                <div className="item-price">₪{item.product.price}</div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="summary-info">
              <h2 className="total-title">סה"כ:</h2>
              <p className="total-amount">₪{total}</p>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              📦 הזמן את הפריטים
            </button>
          </div>
        </>
      )}

      {/* Edit Rental Modal */}
      {editModalOpen && selectedCartItem && (
        <EditRentalModal
          isOpen={editModalOpen}
          onRequestClose={() => setEditModalOpen(false)}
          currentRentalPeriod={selectedCartItem.rentalPeriod}
          onSave={handleUpdate}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteModalOpen && selectedCartItem && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onRequestClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default CartPage;
