// src/components/CartPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./CartPage.css";
import EditRentalModal from "./EditRentalModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import websocketService from "../services/websocketService";

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

const CartPage = () => {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);

  // Real-time WebSocket state
  const [realTimeInventory, setRealTimeInventory] = useState(new Map());
  const [inventoryConflicts, setInventoryConflicts] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const navigate = useNavigate();
  const userId = user?._id;

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token || user.accessToken;
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
  };

  // WebSocket connection and real-time inventory updates
  useEffect(() => {
    const handleConnectionStatus = (status) => {
      setIsConnected(status.connected);
    };

    const handleAuthenticated = (data) => {
      console.log('Cart WebSocket authenticated:', data);
      setIsConnected(true);
    };

    const handleInventoryUpdate = (data) => {
      console.log('Cart inventory update:', data);
      
      // Update real-time inventory map
      setRealTimeInventory(prev => new Map(prev.set(data.productId, data.availability)));
      setLastUpdated(new Date());

      // Check for conflicts with cart items
      const conflictingItems = cartItems.filter(item => {
        if (item.product._id === data.productId) {
          // Check if the item quantity exceeds available units
          const availableUnits = data.availability.availableNow || 0;
          return availableUnits < 1; // Item no longer available
        }
        return false;
      });

      if (conflictingItems.length > 0) {
        const conflicts = new Map();
        conflictingItems.forEach(item => {
          conflicts.set(item._id, {
            type: 'unavailable',
            message: `המוצר "${item.product.name}" אינו זמין יותר`,
            availableUnits: data.availability.availableNow || 0,
            timestamp: new Date()
          });
        });
        setInventoryConflicts(prev => new Map([...prev, ...conflicts]));
      }
    };

    const handleProductAvailabilityUpdate = (data) => {
      console.log('🔄 Cart product availability update:', data);
      handleInventoryUpdate(data); // Reuse the same logic
    };

    // Set up WebSocket listeners
    websocketService.on('connection-status', handleConnectionStatus);
    websocketService.on('authenticated', handleAuthenticated);
    websocketService.on('inventory-update', handleInventoryUpdate);
    websocketService.on('product-availability-update', handleProductAvailabilityUpdate);

    // Check current connection status immediately
    if (websocketService.isConnected()) {
      console.log('Cart detected existing WebSocket connection');
      setIsConnected(true);
    } else if (token) {
      // Initialize WebSocket if not connected and we have a token
      console.log('Cart initializing WebSocket connection');
      websocketService.initialize(token);
    }

    return () => {
      websocketService.off('connection-status', handleConnectionStatus);
      websocketService.off('authenticated', handleAuthenticated);
      websocketService.off('inventory-update', handleInventoryUpdate);
      websocketService.off('product-availability-update', handleProductAvailabilityUpdate);
    };
  }, [token, cartItems]);

  // Watch products in cart for real-time updates
  useEffect(() => {
    if (isConnected && cartItems.length > 0) {
      cartItems.forEach(item => {
        websocketService.watchProduct(item.product._id);
      });

      return () => {
        cartItems.forEach(item => {
          websocketService.unwatchProduct(item.product._id);
        });
      };
    }
  }, [isConnected, cartItems]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const config = getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/carts/${userId}`, config);
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
      const config = getAuthHeaders();
      await axios.delete(`${API_URL}/api/carts/${selectedCartItem._id}`, config);
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
      const config = getAuthHeaders();
      await axios.put(`${API_URL}/api/carts/${selectedCartItem._id}`, {
        rentalPeriod: newDates,
      }, config);
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

    // Check for any inventory conflicts before proceeding
    const hasConflicts = inventoryConflicts.size > 0;
    const conflictedItems = cartItems.filter(item => inventoryConflicts.has(item._id));
    
    if (hasConflicts) {
      setError(`לא ניתן להמשיך - יש בעיות זמינות עם ${conflictedItems.length} מוצרים. אנא בדוק והסר את הפריטים הלא זמינים.`);
      return;
    }

    // Validate real-time availability for all items
    const unavailableItems = cartItems.filter(item => {
      const realtimeData = realTimeInventory.get(item.product._id);
      if (realtimeData) {
        return realtimeData.availableNow < 1;
      }
      return false;
    });

    if (unavailableItems.length > 0) {
      setError(`חלק מהמוצרים לא זמינים יותר. אנא רענן את העמוד ובדוק שוב.`);
      return;
    }

    navigate("/checkout");
  };

  // Dismiss inventory conflict
  const dismissConflict = (cartItemId) => {
    setInventoryConflicts(prev => {
      const newConflicts = new Map(prev);
      newConflicts.delete(cartItemId);
      return newConflicts;
    });
  };

  // Remove conflicted item from cart
  const removeConflictedItem = async (cartItemId) => {
    try {
      const config = getAuthHeaders();
      await axios.delete(`${API_URL}/api/carts/${cartItemId}`, config);
      dismissConflict(cartItemId);
      fetchCartItems();
    } catch (err) {
      console.error('Error removing conflicted item:', err);
      setError("שגיאה בהסרת הפריט");
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
        <h1 className="cart-title">
          <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z"/>
          </svg>
          העגלה שלי
        </h1>
        <p className="cart-subtitle">בדוק את הפריטים שלך לפני המעבר לתהליך ההזמנה</p>
        
        {/* Real-time connection status */}
        <div className="cart-connection-status">
          <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <svg className="status-icon" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="6"/>
            </svg>
          </span>
          <span className="status-text">
            {isConnected ? 'מעודכן בזמן אמת' : 'לא מחובר'}
            {lastUpdated && ` • עודכן לפני ${Math.floor((new Date() - lastUpdated) / 1000)} שניות`}
          </span>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* Inventory conflicts alert */}
      {inventoryConflicts.size > 0 && (
        <div className="inventory-conflicts-alert">
          <div className="conflicts-header">
            <h3>
              <svg className="alert-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
              בעיות זמינות בעגלה
            </h3>
            <p>חלק מהפריטים בעגלה שלך אינם זמינים יותר</p>
          </div>
          {Array.from(inventoryConflicts.entries()).map(([cartItemId, conflict]) => {
            const item = cartItems.find(ci => ci._id === cartItemId);
            if (!item) return null;
            
            return (
              <div key={cartItemId} className="conflict-item">
                <div className="conflict-info">
                  <span className="product-name">{item.product.name}</span>
                  <span className="conflict-message">{conflict.message}</span>
                  <small className="conflict-time">
                    {new Date(conflict.timestamp).toLocaleTimeString('he-IL')}
                  </small>
                </div>
                <div className="conflict-actions">
                  <button 
                    className="remove-btn" 
                    onClick={() => removeConflictedItem(cartItemId)}
                  >
                    הסר מהעגלה
                  </button>
                  <button 
                    className="dismiss-btn" 
                    onClick={() => dismissConflict(cartItemId)}
                  >
                    התעלם
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,7H18V6A2,2 0 0,0 16,4H8A2,2 0 0,0 6,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M8,6H16V7H8V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H18V19Z"/>
              </svg>
            </div>
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
                <div className="item-details">
                  <h3 className="product-name">{item.product.name}</h3>
                  <p className="product-category">{item.product.category}</p>
                  
                  {/* Real-time availability status */}
                  {(() => {
                    const realtimeData = realTimeInventory.get(item.product._id);
                    const hasConflict = inventoryConflicts.has(item._id);
                    
                    if (hasConflict) {
                      return (
                        <div className="availability-status conflict">
                          <span className="status-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                            </svg>
                          </span>
                          <span className="status-text">לא זמין</span>
                        </div>
                      );
                    }
                    
                    if (realtimeData) {
                      const { availableNow, currentlyReserved, currentlyRented } = realtimeData;
                      let statusClass = 'available';
                      let statusIcon = (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                        </svg>
                      );
                      let statusText = `${availableNow} זמין`;
                      
                      if (availableNow === 0) {
                        statusClass = 'unavailable';
                        statusIcon = (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                          </svg>
                        );
                        statusText = 'לא זמין';
                      } else if (availableNow <= 2) {
                        statusClass = 'low-stock';
                        statusIcon = (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                          </svg>
                        );
                        statusText = `רק ${availableNow} זמין`;
                      }
                      
                      return (
                        <div className={`availability-status ${statusClass}`}>
                          <span className="status-icon">{statusIcon}</span>
                          <span className="status-text">{statusText}</span>
                          {(currentlyReserved > 0 || currentlyRented > 0) && (
                            <small className="usage-details">
                              {currentlyRented > 0 && `${currentlyRented} מושכר`}
                              {currentlyReserved > 0 && `${currentlyReserved} שמור`}
                            </small>
                          )}
                          <span className="live-indicator" title="מעודכן בזמן אמת">
                            <svg className="pulse" viewBox="0 0 12 12" fill="currentColor">
                              <circle cx="6" cy="6" r="6"/>
                            </svg>
                          </span>
                        </div>
                      );
                    }
                    
                    // Fallback to product inventory data
                    const totalUnits = item.product.inventory?.totalUnits || 0;
                    return (
                      <div className={`availability-status ${totalUnits > 0 ? 'available' : 'unavailable'}`}>
                        <span className="status-icon">
                          {totalUnits > 0 ? (
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                            </svg>
                          )}
                        </span>
                        <span className="status-text">
                          {totalUnits > 0 ? `${totalUnits} זמין` : 'לא זמין'}
                        </span>
                        <small className="static-data">(נתונים סטטיים)</small>
                      </div>
                    );
                  })()}
                  
                  <div className="rental-period">
                    <strong>תקופת השכרה:</strong>
                    <br />
                    {formatDate(new Date(item.rentalPeriod.startDate))} - {formatDate(new Date(item.rentalPeriod.endDate))}
                  </div>
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
                <div className="summary-row total-row">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-notice">
                <h4>שלבים נוספים נדרשים:</h4>
                <ul>
                  <li>
                    <svg className="step-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"/>
                    </svg>
                    חתימה על הסכם השכירות
                  </li>
                  <li>
                    <svg className="step-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    העלאת תעודת זהות
                  </li>
                  <li>
                    <svg className="step-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                    </svg>
                    בחירת מיקום איסוף והחזרה
                  </li>
                  <li>
                    <svg className="step-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.8,10.9C9.53,10.31 8.8,9.7 8.8,8.75C8.8,7.66 9.81,6.9 11.5,6.9C13.28,6.9 13.94,7.75 14,9H16.21C16.14,7.28 15.09,5.7 13,5.19V3H10V5.16C8.06,5.58 6.5,6.84 6.5,8.77C6.5,11.08 8.41,12.23 11.2,12.9C13.7,13.5 14.2,14.38 14.2,15.31C14.2,16 13.71,17.1 11.5,17.1C9.44,17.1 8.63,16.18 8.5,15H6.32C6.44,17.19 8.08,18.42 10,18.83V21H13V18.85C14.95,18.5 16.5,17.35 16.5,15.3C16.5,12.46 14.07,11.5 11.8,10.9Z"/>
                    </svg>
                    בחירת אמצעי תשלום
                  </li>
                </ul>
              </div>

              <div className="checkout-actions">
                <button className="checkout-btn" onClick={handleCheckout}>
                  <span className="btn-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                    </svg>
                  </span>
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