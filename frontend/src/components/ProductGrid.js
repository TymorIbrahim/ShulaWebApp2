// src/components/ProductGrid.js
import React from "react"; 
import { Link } from "react-router-dom";
import "./ProductGrid.css"; // Create and import CSS file

// Component receives 'products' as a prop from App.js
const ProductGrid = ({ products }) => { 

    // Handle loading or empty state based on props
    if (!products) {
        // If App.js passed down a loading state, you could use that here
        // Example: if (isLoading) return <p>Loading products...</p>; 
        return <p>Loading products...</p>; // Simple fallback
    }
    if (products.length === 0) {
        return <p>No products available at the moment.</p>;
    }

    return (
        <div className="product-grid-container">
            <h2 className="grid-title">המוצרים שלנו</h2>
            <div className="product-grid">
                {products.map((product) => (
                    // Ensure product._id or product.id exists and is unique
                    <Link
                        key={product._id || product.id} 
                        to={`/products/${product._id || product.id}`} // Use correct ID for link
                        style={{ textDecoration: "none", color: "inherit" }}
                        className="product-card-link" 
                    >
                        <div className="product-card">
                            <div className="image-container">
                                <img
                                    // Use placeholder if image URL missing/invalid
                                    src={product.productImageUrl || '/placeholder-image.png'} 
                                    alt={product.name || 'Product Image'}
                                    className="product-image"
                                />
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name || 'Product Name'}</h3>
                                <p className="product-price">₪{product.price ?? 'N/A'}</p>
                                {/* Button is now just visual, navigation handled by Link */}
                                <div className="buy-button-styled"> 
                                    פרטים נוספים 
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;