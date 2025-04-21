//C:\Users\User\ShulaWebApp2\frontend\src\components\ProductGrid.js
import React, { useState } from "react";
 import { Link } from "react-router-dom";
 import "./ProductGrid.css";
 

 const ProductGrid = ({ products }) => {
  const [categoryFilter, setCategoryFilter] = useState("הכל"); // Default to 'הכל'
 

  const categories = ["הכל", "אירוח ואירועים", "גינון", "פנאי", "כלי עבודה", "קמפינג", "שונות"];
 

  const filteredProducts = categoryFilter === "הכל"
  ? products
  : products.filter((product) => product.category === categoryFilter);
 

  // Handle loading or empty state based on props
  if (!products) {
  return <p>טוען מוצרים...</p>;
  }
  if (products.length === 0) {
  return <p>אין מוצרים זמינים כרגע.</p>;
  }
 

  return (
  <div className="product-grid-container">
  <div className="intro-text">
  <h2 className="intro-title">מה יש אצל שולה?</h2>
  <p className="intro-paragraph">
  בקטלוג תמצאו את כל הציוד שנמצא אצל שולה.
  <br />
  המחירים מציינים את העלות להשאלה עבור 48 שעות.
  <br />
  אם יש עוד שאלות תוכלו לבקר בדף השאלות ותשובות שלנו!
  </p>
  </div>
 

  <div className="filter-container">
  <h3 className="filter-title">קטגוריה</h3>
  <div className="category-filter">
  {categories.map((category) => (
  <button
  key={category}
  className={`category-button ${categoryFilter === category ? "active" : ""}`}
  onClick={() => setCategoryFilter(category)}
  >
  {category}
  </button>
  ))}
  </div>
  <button className="reset-filter-button" onClick={() => setCategoryFilter("הכל")}>
  איפוס בחירה
  </button>
  </div>
 

  <div className="product-grid">
  {filteredProducts.map((product) => (
  <Link
  key={product._id || product.id}
  to={`/products/${product._id || product.id}`}
  className="product-card-link"
  >
  <div className="product-card">
  <div className="image-container">
  <img
  src={product.productImageUrl || "/placeholder-image.png"}
  alt={product.name || "Product Image"}
  className="product-image"
  />
  </div>
  <div className="product-info">
  <h3 className="product-name">{product.name || "שם מוצר"}</h3>
  <p className="product-price">₪{product.price ?? "מחיר לא זמין"}</p>
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
