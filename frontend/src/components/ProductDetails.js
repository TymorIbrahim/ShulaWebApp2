import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../services/productService";
import RentalDatePickerModal from "./RentalDatePickerModal";
import "./ProductDetails.css";

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProduct(productId);
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product details:", error);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        // Open the modal when the button is clicked
        setModalIsOpen(true);
    };

    const handleModalClose = () => {
        setModalIsOpen(false);
    };

    const handleConfirmRental = ({ startDate, endDate }) => {
        // Here you can integrate with your cart logic.
        // For example, you might call a function to add the product with these rental dates.
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

            {/* Rental Date Picker Modal */}
            <RentalDatePickerModal
                isOpen={modalIsOpen}
                onRequestClose={handleModalClose}
                onConfirm={handleConfirmRental}
            />
        </div>
    );
};

export default ProductDetails;
