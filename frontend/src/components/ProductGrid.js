//C:\Users\User\ShulaWebApp2\frontend\src\components\ProductGrid.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import "./ProductGrid.css";

const ProductGrid = () => {
  // State for products and API response
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    pageSize: 12
  });
  const [statistics, setStatistics] = useState({});
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    conditions: []
  });

  // State for UI and filters
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "name",
    sortOrder: "asc",
    minPrice: "",
    maxPrice: "",
    inStock: undefined,
    condition: ""
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products function
  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      
      const params = {
        page,
        limit: 12,
        search: debouncedSearchTerm,
        category: filters.category || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        inStock: filters.inStock,
        condition: filters.condition || undefined
      };

      console.log("🔄 Fetching products with params:", params);
      const response = await getProducts(params);
      
      setProducts(response.products || []);
      setPagination(response.pagination || {});
      setStatistics(response.statistics || {});
      setAvailableFilters(response.filters || { categories: [], conditions: [] });
      
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError("שגיאה בטעינת מוצרים. אנא נסה שנית.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filters]);

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts(1); // Reset to page 1 when filters change
  }, [fetchProducts]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    fetchProducts(page);
    // Scroll to top of products
    document.querySelector('.product-grid-container')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }, [fetchProducts]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      sortBy: "name",
      sortOrder: "asc",
      minPrice: "",
      maxPrice: "",
      inStock: undefined,
      condition: ""
    });
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  // Memoized categories for better performance
  const categories = useMemo(() => {
    const defaultCategories = ["אירוח ואירועים", "גינון", "פנאי", "כלי עבודה", "קמפינג", "שונות"];
    const apiCategories = availableFilters.categories || [];
    
    // Combine and deduplicate
    const allCategories = [...new Set([...defaultCategories, ...apiCategories])];
    return allCategories;
  }, [availableFilters.categories]);

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const { currentPage, totalPages } = pagination;
    
    // Always show first page
    if (totalPages > 1) {
      buttons.push(1);
    }
    
    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis if there's a gap
    if (start > 2) {
      buttons.push('...');
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        buttons.push(i);
      }
    }
    
    // Add ellipsis if there's a gap
    if (end < totalPages - 1) {
      buttons.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      buttons.push(totalPages);
    }
    
    return buttons;
  };

  return (
    <div className="product-grid-container">
      {/* Header Section */}
      <div className="intro-text">
        <h2 className="intro-title">מה יש אצל שולה?</h2>
        <p className="intro-paragraph">
          בקטלוג תמצאו את כל הציוד שנמצא אצל שולה.
          <br />
          המחירים מציינים את העלות להשאלה עבור 48 שעות.
          <br />
          {statistics.total && (
            <span>סה"כ {statistics.total} מוצרים זמינים</span>
          )}
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="חיפוש מוצרים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="filters-container">
        <div className="filters-row">
          {/* Category Filter */}
          <div className="filter-group">
            <label htmlFor="category-select">קטגוריה:</label>
            <select
              id="category-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">הכל</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="filter-group">
            <label htmlFor="sort-select">מיון:</label>
            <select
              id="sort-select"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="filter-select"
            >
              <option value="name-asc">שם (א-ת)</option>
              <option value="name-desc">שם (ת-א)</option>
              <option value="price-asc">מחיר (נמוך לגבוה)</option>
              <option value="price-desc">מחיר (גבוה לנמוך)</option>
              <option value="createdAt-desc">חדשים ביותר</option>
              <option value="createdAt-asc">ישנים ביותר</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group price-range">
            <label>טווח מחירים:</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="מ-"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="עד"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="price-input"
              />
            </div>
          </div>

          {/* In Stock Filter */}
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.inStock === true}
                onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : undefined)}
              />
              רק במלאי
            </label>
          </div>

          {/* Reset Filters */}
          <button onClick={resetFilters} className="reset-filters-btn">
            איפוס מסננים
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        {loading ? (
          <span>טוען...</span>
        ) : (
          <span>
            מציג {products.length} מתוך {pagination.totalProducts} מוצרים
            {debouncedSearchTerm && ` עבור "${debouncedSearchTerm}"`}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchProducts(1)} className="retry-btn">
            נסה שוב
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>טוען מוצרים...</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="no-products">
              <p>לא נמצאו מוצרים התואמים לחיפוש שלך</p>
              <button onClick={resetFilters} className="reset-search-btn">
                איפוס חיפוש
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <Link
                  key={product._id || product.id}
                  to={`/products/${product._id || product.id}`}
                  className="product-card-link"
                >
                  <div className="product-card">
                    <div className={`image-container ${product.productImageUrl ? 'has-image' : ''}`}>
                      <img
                        src={product.productImageUrl || "/placeholder-image.png"}
                        alt={product.name || "Product Image"}
                        className="product-image"
                        loading="lazy"
                        onLoad={(e) => {
                          e.target.parentElement.classList.add('has-image');
                        }}
                        onError={(e) => {
                          e.target.parentElement.classList.remove('has-image');
                          e.target.style.opacity = '0';
                        }}
                      />
                      {/* Stock Status Badge */}
                      {product.inventory && (
                        <div className={`stock-badge ${product.inventory.totalUnits > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.inventory.totalUnits > 0 ? 'במלאי' : 'אזל'}
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name || "שם מוצר"}</h3>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">₪{product.price ?? "מחיר לא זמין"}</p>
                      <div className="buy-button-styled">פרטים נוספים</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="pagination-btn prev-btn"
                >
                  ← הקודם
                </button>

                {/* Page Numbers */}
                {getPaginationButtons().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="pagination-ellipsis">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`pagination-btn ${page === pagination.currentPage ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="pagination-btn next-btn"
                >
                  הבא →
                </button>
              </div>
              
              <div className="pagination-info">
                עמוד {pagination.currentPage} מתוך {pagination.totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
