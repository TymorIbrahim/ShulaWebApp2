// src/components/CartPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./CartPage.css";
import EditRentalModal from "./EditRentalModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

const CartPage = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);

  const navigate = useNavigate();
  const userId = user?._id;

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token || user.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/carts/${userId}`, { headers });
      setCartItems(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "שגיאה בטעינת עגלת הקניות");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const openEditModal = (item) => {
    setSelectedCartItem(item);
    setEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedCartItem(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/api/carts/${selectedCartItem._id}`, { headers });
      setDeleteModalOpen(false);
      setSelectedCartItem(null);
      fetchCartItems();
    } catch (err) {
      console.error(err);
      setError("מחיקה נכשלה");
      setDeleteModalOpen(false);
    }
  };

  const handleUpdate = async (newDates) => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API_URL}/api/carts/${selectedCartItem._id}`, {
        rentalPeriod: newDates,
      }, { headers });
      setEditModalOpen(false);
      setSelectedCartItem(null);
      fetchCartItems();
    } catch (err) {
      console.error(err);
      setError("עדכון נכשל");
      setEditModalOpen(false);
    }
  };

  // Navigate to the new comprehensive checkout system
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError("העגלה ריקה");
      return;
    }
    navigate("/checkout");
  };

  const calculateRentalPrice = (item) => {
    const { startDate, endDate } = item.rentalPeriod;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = (end - start) / 1000 / 3600;
    let periods = Math.max(1, Math.ceil(hours / 48));

    // Deduct a period if the end date is a Sunday (day 0)
    if (end.getDay() === 0) {
      periods = Math.max(1, periods - 1);
    }

    return periods * item.product.price;
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const total = cartItems.reduce((sum, item) => sum + calculateRentalPrice(item), 0);

  if (loading) return <p className="loading">טוען עגלה...</p>;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">🛒 העגלה שלי</h1>
        <p className="cart-subtitle">בדוק את הפריטים שלך לפני המעבר לתהליך ההזמנה</p>
      </div>
      {error && <p className="error-msg">{error}</p>}

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">🛒</div>
            <h2>העגלה שלך ריקה</h2>
            <p>הוסף פריטים לעגלה כדי להתחיל בתהליך ההזמנה</p>
            <button 
              className="browse-products-btn"
              onClick={() => navigate("/products")}
            >
              דפדף במוצרים
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product.productImageUrl || "/placeholder-image.png"}
                    alt={item.product.name}
                  />
                </div>
                <div className="item-info">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-dates">
                    השכרה: {formatDate(new Date(item.rentalPeriod.startDate))} - {" "}
                    {formatDate(new Date(item.rentalPeriod.endDate))}
                  </p>
                  <p className="item-description">{item.product.description}</p>
                </div>
                <div className="item-actions">
                  <button className="action-btn edit-btn" onClick={() => openEditModal(item)}>
                    ערוך
                  </button>
                  <button className="action-btn delete-btn" onClick={() => openDeleteModal(item)}>
                    מחק
                  </button>
                </div>
                <div className="item-price">
                  ₪{calculateRentalPrice(item).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <div className="summary-header">
                <h2>סיכום הזמנה</h2>
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>מספר פריטים:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="summary-row">
                  <span>סכום ביניים:</span>
                  <span>₪{total.toFixed(2)}</span>
                </div>
                <div className="summary-row tax-row">
                  <span>מע"מ (17%):</span>
                  <span>₪{(total * 0.17).toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{(total * 1.17).toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-notice">
                <h4>שלבים נוספים נדרשים:</h4>
                <ul>
                  <li>✍️ חתימה על הסכם השכירות</li>
                  <li>📄 העלאת תעודת זהות</li>
                  <li>📍 בחירת מיקום איסוף והחזרה</li>
                  <li>💳 בחירת אמצעי תשלום</li>
                </ul>
              </div>

              <div className="checkout-actions">
                <button className="checkout-btn" onClick={handleCheckout}>
                  <span className="btn-icon">🚀</span>
                  המשך לתהליך ההזמנה
                </button>
                
                <button className="continue-shopping-btn" onClick={() => navigate("/products")}>
                  ← המשך בקנייה
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {editModalOpen && selectedCartItem && (
        <EditRentalModal
          isOpen={editModalOpen}
          onRequestClose={() => setEditModalOpen(false)}
          currentRentalPeriod={selectedCartItem.rentalPeriod}
          onSave={handleUpdate}
        />
      )}
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