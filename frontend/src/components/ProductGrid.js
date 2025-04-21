import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductGrid.css"; // Your custom styles

const ProductGrid = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Show loading or empty state if needed
  if (!products) return <p>Loading products...</p>;
  if (products.length === 0) return <p>No products available at the moment.</p>;

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-grid-container">
      <h2 className="grid-title">המוצרים שלנו</h2>

      {/* 🔍 Search Bar */}
      <div className="search-bar" style={{ textAlign: "right", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="חפש מוצר לפי שם..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
            direction: "rtl",
            width: "100%",
            maxWidth: "300px"
          }}
        />
      </div>

      {/* 🧱 Product Cards */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <Link
            key={product._id || product.id}
            to={`/products/${product._id || product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
            className="product-card-link"
          >
            <div className="product-card">
              <div className="image-container">
                <img
                  src={product.productImageUrl || "/placeholder-image.png"}
                  alt={product.name || "Product"}
                  className="product-image"
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name || "שם מוצר"}</h3>
                <p className="product-price">₪{product.price ?? "N/A"}</p>
                <div className="buy-button-styled">פרטים נוספים</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
