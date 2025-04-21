// src/components/CartPage.js
 import React, { useState, useEffect } from "react";
 import axios from "axios";
 import { useNavigate } from "react-router-dom";
 import { useAuth } from "../context/AuthContext";
 import "./CartPage.css";
 import EditRentalModal from "./EditRentalModal";
 import ConfirmDeleteModal from "./ConfirmDeleteModal";
 

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
 

  const fetchCartItems = async () => {
  try {
  setLoading(true);
  const response = await axios.get(`http://localhost:5002/api/carts/${userId}`);
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
  await axios.delete(`http://localhost:5002/api/carts/${selectedCartItem._id}`);
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
  await axios.put(`http://localhost:5002/api/carts/${selectedCartItem._id}`, {
  rentalPeriod: newDates,
  });
  setEditModalOpen(false);
  setSelectedCartItem(null);
  fetchCartItems();
  } catch (err) {
  console.error(err);
  setError("עדכון נכשל");
  setEditModalOpen(false);
  }
  };
 

  const handleCheckout = async () => {
  try {
  await axios.post("http://localhost:5002/api/carts/checkout", { user: userId });
  alert("הזמנה בוצעה בהצלחה!");
  fetchCartItems();
  } catch (err) {
  console.error(err);
  setError("ההזמנה נכשלה");
  }
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
  </div>
  {error && <p className="error-msg">{error}</p>}
 

  {cartItems.length === 0 ? (
  <p className="empty-cart">העגלה שלך ריקה.</p>
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
  <div className="summary-info">
  <h2 className="total-title">סה"כ לתשלום:</h2>
  <p className="total-amount">₪{total.toFixed(2)}</p>
  </div>
  <button className="checkout-btn" onClick={handleCheckout}>
  📦 הזמן את הפריטים
  </button>
  <button className="secondary" onClick={() => navigate("/products")}>
  ← המשך בקנייה
  </button>
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