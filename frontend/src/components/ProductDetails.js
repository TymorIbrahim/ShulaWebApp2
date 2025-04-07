// src/components/ProductDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../services/productService"; // Assumes this fetches single product
import RentalDatePickerModal from "./RentalDatePickerModal";
import { useCart } from '../context/CartContext'; 
import "./ProductDetails.css"; // Create and import CSS file

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const navigate = useNavigate();
    const { addToCart } = useCart(); 

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true); // Start loading
            setError(null); // Clear previous errors
            try {
                const data = await getProduct(productId); 
                console.log('ProductDetails: Fetched Product Data:', data); 
                if (!data) {
                    throw new Error('Product not found');
                }
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product details:", error);
                setError(error.message || "Failed to load product details.");
                setProduct(null); 
            } finally {
                setIsLoading(false); // Finish loading
            }
        };
        
        if (productId) {
            fetchProduct();
        } else {
            setError("Product ID is missing.");
            setIsLoading(false);
        }
    }, [productId]); // Dependency array includes productId

    const handleAddToCartClick = () => {
        if (!product) return; 
        setModalIsOpen(true);
    };

    const handleModalClose = () => {
        setModalIsOpen(false);
    };

    const handleConfirmRental = ({ startDate, endDate }) => {
        console.log('ProductDetails: handleConfirmRental called with dates:', { startDate, endDate }); 
        if (product) {
            console.log("ProductDetails: Calling addToCart with product:", product); 
            
            // Call addToCart with the product data
            // CartContext handles structuring the item (e.g., mapping _id to id)
            // TODO: Consider passing dates if needed: addToCart({ ...product, rentalStartDate: startDate, rentalEndDate: endDate });
            addToCart(product); 
            
            alert(
              `"${product.name}" נוסף לעגלה להשכרה מה-${startDate.toLocaleDateString()} עד ${endDate.toLocaleDateString()}`
            ); 
        } else {
            console.error("Cannot add to cart, product data is missing.");
            alert("שגיאה בהוספת המוצר לעגלה.");
        }
        handleModalClose();
        // navigate('/cart-page'); // Optional navigation
    };

    // --- Render Logic ---
    if (isLoading) return <div>טוען פרטי מוצר...</div>; 
    if (error) return <div style={{color: 'red'}}>שגיאה: {error}</div>;
    if (!product) return <div>לא נמצא מוצר.</div>; // Handle case where product is null after loading

    return (
        <div className="product-details-container">
            <img 
              src={product.productImageUrl || '/placeholder-image.png'} // Use placeholder
              alt={product.name || 'Product Image'} 
              className="product-details-image"
            /> 
            <div className="product-info-section">
                <h2>{product.name || 'Product Name'}</h2>
                <div
                    className="product-description"
                    // Ensure description is treated as safe HTML if using this
                    dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} 
                />
                <div className="product-price">₪{product.price ?? 'N/A'}</div> 
                
                <button className="buy-button" onClick={handleAddToCartClick}>
                    הוסף לסל
                </button>
                
                <button 
                    className="buy-button back-button" 
                    onClick={() => navigate('/products')} // Navigate explicitly back
                >
                    חזרה למוצרים
                </button>
            </div>

            <RentalDatePickerModal
                isOpen={modalIsOpen}
                onRequestClose={handleModalClose}
                onConfirm={handleConfirmRental}
            />
        </div>
    );
};

export default ProductDetails;