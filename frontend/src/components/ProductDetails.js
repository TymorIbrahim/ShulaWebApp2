import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../services/productService";
import { getBookedDates } from "../services/orderService"; // Make sure to create this service file
import RentalDatePickerModal from "./RentalDatePickerModal";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();

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
        // Convert returned date strings to Date objects (if needed)
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

  const handleConfirmRental = ({ startDate, endDate }) => {
    // Integrate with your cart logic here.
    console.log("Rental confirmed:", { startDate, endDate });
    alert(
      `המוצר הושכר מה-${startDate.toLocaleDateString()} עד ${endDate.toLocaleDateString()}`
    );
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

      {/* Rental Date Picker Modal receives bookedDates as prop */}
      <RentalDatePickerModal
        isOpen={modalIsOpen}
        onRequestClose={handleModalClose}
        onConfirm={handleConfirmRental}
        bookedDates={bookedDates}
      />
    </div>
  );
};

export default ProductDetails;
