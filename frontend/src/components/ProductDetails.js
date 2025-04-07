import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../services/productService";
import { getBookedDates } from "../services/orderService";
import RentalDatePickerModal from "./RentalDatePickerModal";
import { addToCart } from "../services/cartService";
import ChoiceModal from "./ChoiceModal";  // Import the new modal component
import "./ProductDetails.css";

const ProductDetails = ({ user }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate("/loginpage");
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

    // Fetch booked dates (accepted orders) for this product
    const fetchBookedDates = async () => {
      try {
        const dates = await getBookedDates(productId);
        // Convert returned date strings to Date objects
        const convertedDates = dates.map(dateStr => new Date(dateStr));
        setBookedDates(convertedDates);
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

  // Instead of window.confirm, open the custom ChoiceModal after successful add-to-cart
  const handleConfirmRental = async ({ startDate, endDate }) => {
    if (!user) {
      alert("נא להתחבר כדי להוסיף לעגלה.");
      navigate("/loginpage");
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
      // Open the Choice Modal instead of using window.confirm
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
      <img src={product.productImageUrl} alt={product.name} />
      <div className="product-info-section">
        <h2>{product.name}</h2>
        <div
          className="product-description"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <div className="product-price">₪{product.price}</div>
        <button className="buy-button" onClick={handleAddToCart}>
          הוסף לסל
        </button>
        <button 
          className="buy-button back-button" 
          onClick={() => navigate(-1)}
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
      />

      {/* Choice Modal for next action after adding to cart */}
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
