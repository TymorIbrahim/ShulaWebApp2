import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularProducts } from '../services/productService';
import './PopularProducts.css';

// Mock data for development/testing when backend is not available
const MOCK_POPULAR_PRODUCTS = [
  {
    _id: '1',
    name: 'מקרן מולטימדיה',
    category: 'אירוח ואירועים',
    price: 80,
    productImageUrl: '',
    featured: true,
    inventory: { totalUnits: 3 },
    rentalStats: { totalRentals: 25, popularityScore: 9 }
  },
  {
    _id: '2',
    name: 'אוהל אירועים 4x6',
    category: 'אירוח ואירועים',
    price: 150,
    productImageUrl: '',
    featured: false,
    inventory: { totalUnits: 2 },
    rentalStats: { totalRentals: 18, popularityScore: 8 }
  },
  {
    _id: '3',
    name: 'מכונת קפה מקצועית',
    category: 'אירוח ואירועים',
    price: 60,
    productImageUrl: '',
    featured: true,
    inventory: { totalUnits: 1 },
    rentalStats: { totalRentals: 22, popularityScore: 7 }
  },
  {
    _id: '4',
    name: 'מקדחה חזקה',
    category: 'כלי עבודה',
    price: 45,
    productImageUrl: '',
    featured: false,
    inventory: { totalUnits: 4 },
    rentalStats: { totalRentals: 15, popularityScore: 6 }
  }
];

const PopularProducts = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const products = await getPopularProducts(8);
        setPopularProducts(products);
        setUsingMockData(false);
      } catch (err) {
        console.error('Error fetching popular products:', err);
        console.log('Using mock data for UI testing');
        setPopularProducts(MOCK_POPULAR_PRODUCTS);
        setUsingMockData(true);
        setError('');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  if (loading) {
    return (
      <div className="popular-products-section">
        <div className="container">
          <h2>הציוד הפופולרי ביותר</h2>
          <div className="loading-spinner">טוען...</div>
        </div>
      </div>
    );
  }

  if (error && !usingMockData) {
    return (
      <div className="popular-products-section">
        <div className="container">
          <h2>הציוד הפופולרי ביותר</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (popularProducts.length === 0) {
    return null; // Don't show anything if no popular products
  }

  return (
    <section className="popular-products-section">
      <div className="container">
        <div className="section-header">
          <h2>הציוד הפופולרי ביותר</h2>
          <p className="section-subtitle">
            הפריטים הנבחרים ביותר על ידי הקהילה - זמינים להשכרה עכשיו
          </p>
          {usingMockData && (
            <div style={{ 
              background: '#e3f2fd', 
              padding: '10px', 
              borderRadius: '8px', 
              margin: '10px 0',
              fontSize: '0.9rem',
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M7.5,5.6L5,7L6.4,8.5L8.9,7.1L7.5,5.6M12,4C12.6,4 13,4.4 13,5S12.6,6 12,6S11,5.6 11,5S11.4,4 12,4M21,10.5V12.5H19V10.5H21M13,14.1L15.5,12.8L16.9,14.3L14.4,15.6L13,14.1M6.4,15.5L8,14.1L6.6,12.6L5,14L6.4,15.5M12,19A1,1 0 0,1 11,18A1,1 0 0,1 12,17A1,1 0 0,1 13,18A1,1 0 0,1 12,19M14.4,21L15.8,19.5L14.4,18.1L13,19.4L14.4,21M3,10.5V12.5H5V10.5H3Z"/>
              </svg>
              מצב דמו - מציג נתוני דוגמה לבדיקת ממשק משתמש
            </div>
          )}
        </div>

        <div className="popular-products-grid">
          {popularProducts.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="popular-product-card"
            >
              <div className="product-image-container">
                <img
                  src={product.productImageUrl || "/placeholder-image.png"}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.png";
                  }}
                />
                {product.featured && (
                  <div className="featured-badge">מומלץ</div>
                )}
                <div className={`availability-badge ${product.inventory.totalUnits > 0 ? 'available' : 'unavailable'}`}>
                  {product.inventory.totalUnits > 0 ? 'זמין' : 'אזל'}
                </div>
              </div>
              
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <div className="product-stats">
                  {product.rentalStats && (
                    <>
                      {product.rentalStats.totalRentals > 0 && (
                        <span className="rental-count">
                          הושכר {product.rentalStats.totalRentals} פעמים
                        </span>
                      )}
                      {product.rentalStats.popularityScore > 0 && (
                        <span className="popularity-score">
                          ציון פופולריות: {product.rentalStats.popularityScore}/10
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="product-price-info">
                  <span className="price">₪{product.price}</span>
                  <span className="price-period">ל-48 שעות</span>
                </div>
                <div className="rent-now-button">
                  השכר עכשיו
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="view-all-container">
          <Link to="/products" className="view-all-button">
            צפה בכל הציוד הזמין
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularProducts; 