//C:\Users\User\ShulaWebApp2\frontend\src\components\ProductDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../services/productService";
import { getBookedDates } from "../services/orderService";
import RentalDatePickerModal from "./RentalDatePickerModal";
import { addToCart } from "../services/cartService";
import ChoiceModal from "./ChoiceModal";  // Import the modal component
import { useAuth } from "../context/AuthContext"; // Import AuthContext hook
import "./ProductDetails.css";

const ProductDetails = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if no user (using AuthContext)
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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

    const fetchBookedDates = async () => {
      try {
        const dates = await getBookedDates(productId); // dates is now ['YYYY-MM-DD', ...]
        // Keep the dates as strings in the state
        setBookedDates(dates); 
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchProduct();
    fetchBookedDates();
  }, [productId]);

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
      const cartItemData = {
        user: user._id,
        product: product._id,
        rentalPeriod: { startDate, endDate },
      };
      console.log("Sending cart item data:", cartItemData);
      const response = await addToCart(cartItemData);
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
