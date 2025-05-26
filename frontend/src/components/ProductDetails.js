//C:\Users\User\ShulaWebApp2\frontend\src\components\ProductDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../services/productService";
import { getBookedDates, getProductAvailability, validateBooking } from "../services/orderService";
import RentalDatePickerModal from "./RentalDatePickerModal";
import { addToCart } from "../services/cartService";
import ChoiceModal from "./ChoiceModal";  // Import the modal component
import { useAuth } from "../context/AuthContext"; // Import AuthContext hook
import "./ProductDetails.css";

const ProductDetails = () => {
  const { productId } = useParams();
  const { user, authReady } = useAuth();
  const [product, setProduct] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if no user (using AuthContext) - but wait for authReady
  useEffect(() => {
    if (authReady && !user) {
      navigate("/login");
    }
  }, [user, authReady, navigate]);

  useEffect(() => {
    // Fetch product details
    const fetchProduct = async () => {
      try {
        const data = await getProduct(productId);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    const fetchAvailabilityData = async () => {
      try {
        // Get enhanced availability data
        const availData = await getProductAvailability(productId, user?.token);
        setAvailabilityData(availData);
        
        // Keep backward compatibility for date picker
        const dates = await getBookedDates(productId, user?.token);
        setBookedDates(dates); 
      } catch (error) {
        console.error("Error fetching availability data:", error);
      }
    };

    fetchProduct();
    fetchAvailabilityData();
  }, [productId, user?.token]);

  const handleAddToCart = () => {
    setModalIsOpen(true);
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
  };

  // Confirm rental (add to cart) with the selected dates
  const handleConfirmRental = async ({ startDate, endDate }) => {
    if (!user) {
      alert("נא להתחבר כדי להוסיף לעגלה.");
      navigate("/login");
      return;
    }
    
    try {
      // First, validate that the booking is still available
      console.log("Validating booking before adding to cart...");
      const validation = await validateBooking(product._id, startDate, endDate, user.token);
      
      if (!validation.isAvailable) {
        alert(`לא ניתן להוסיף לעגלה: ${validation.message}`);
        return;
      }
      
      // If validation passes, proceed with adding to cart
      const cartItemData = {
        user: user._id,
        product: product._id,
        rentalPeriod: { startDate, endDate },
      };
      
      console.log("Sending cart item data:", cartItemData);
      console.log(`Booking validated: ${validation.availableUnits} units available out of ${validation.totalUnits}`);
      
      const response = await addToCart(cartItemData, user.token); // Pass user token
      console.log("Item added to cart:", response);
      
      // Open the choice modal to decide on next actions
      setChoiceModalOpen(true);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("אירעה שגיאה בהוספת הפריט לעגלה.");
    }
  };

  const handleViewCart = () => {
    setChoiceModalOpen(false);
    navigate("/cart-page");
  };

  const handleContinueShopping = () => {
    setChoiceModalOpen(false);
    navigate("/products");
  };

  if (!authReady) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>טוען...</div>;
  }

  if (!product) return <div>טוען פרטי מוצר...</div>;

  return (
    <div className="product-details-container">
      <img 
        src={product.productImageUrl || '/placeholder-image.png'} 
        alt={product.name || 'Product Image'} 
        className="product-details-image"
      /> 
      <div className="product-info-section">
        <h2>{product.name || 'Product Name'}</h2>
        <div
          className="product-description"
          // Use dangerouslySetInnerHTML if product.description is HTML
          dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} 
        />
        <div className="product-price">₪{product.price ?? 'N/A'}</div>
        
        {/* Inventory Information */}
        {availabilityData && (
          <div className="inventory-info">
            <h4>מידע זמינות:</h4>
            <p>
              <strong>יחידות זמינות:</strong> {availabilityData.totalInventoryUnits} יחידות סה"כ
            </p>
            {availabilityData.availabilityByDate.length > 0 && (
              <div className="current-rentals">
                <p><strong>השכרות פעילות:</strong></p>
                <ul style={{ fontSize: '0.9em', color: '#666' }}>
                  {availabilityData.availabilityByDate.slice(0, 5).map(dateInfo => (
                    <li key={dateInfo.date}>
                      {dateInfo.date}: {dateInfo.rentedUnits} יחידות מושכרות, {dateInfo.availableUnits} זמינות
                    </li>
                  ))}
                  {availabilityData.availabilityByDate.length > 5 && (
                    <li style={{ fontStyle: 'italic' }}>
                      ועוד {availabilityData.availabilityByDate.length - 5} תאריכים...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
                
        <button className="buy-button" onClick={handleAddToCart}>
          הוסף לסל
        </button>
                
        <button 
          className="buy-button back-button" 
          onClick={() => navigate('/products')}
        >
          חזרה למוצרים
        </button>
      </div>

      {/* Rental Date Picker Modal */}
      <RentalDatePickerModal
        isOpen={modalIsOpen}
        onRequestClose={handleModalClose}
        onConfirm={handleConfirmRental}
        bookedDates={bookedDates}
        availabilityData={availabilityData}
        productPrice = {product.price}
      />

      {/* Choice Modal after adding item to cart */}
      <ChoiceModal
        isOpen={choiceModalOpen}
        onClose={() => setChoiceModalOpen(false)}
        onViewCart={handleViewCart}
        onContinueShopping={handleContinueShopping}
      />
    </div>
  );
};

export default ProductDetails;
