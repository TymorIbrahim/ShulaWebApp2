// src/components/ProductForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProduct } from "../services/productService";
import './ProductForm.css';

// --- SVG Icons ---
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
  </svg>
);

const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,2A3,3 0 0,1 15,5V7H18A1,1 0 0,1 19,8V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V8A1,1 0 0,1 6,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="loading-spinner-modern">
    <div className="spinner-ring"></div>
  </div>
);

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(productId);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    condition: 'Excellent',
    specifications: '',
    tags: '',
    featured: false,
    totalUnits: 5,
    minStockAlert: 1
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(editing);

  // Categories and conditions
  const categories = [
    "אירוח ואירועים", "כלי עבודה", "גינון", "קמפינג", "פנאי", "שונות"
  ];

  const conditions = [
    { value: 'Excellent', label: 'מעולה', color: '#10b981' },
    { value: 'Very Good', label: 'טוב מאוד', color: '#059669' },
    { value: 'Good', label: 'טוב', color: '#f59e0b' },
    { value: 'Fair', label: 'בינוני', color: '#f97316' },
    { value: 'Needs Repair', label: 'דורש תיקון', color: '#ef4444' }
  ];

  // Load existing product data when editing
  useEffect(() => {
    if (editing) {
      const loadProduct = async () => {
        try {
          setInitialLoading(true);
          const product = await getProduct(productId);
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            category: product.category || '',
            brand: product.brand || '',
            condition: product.condition || 'Excellent',
            specifications: product.specifications || '',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            featured: product.featured || false,
            totalUnits: product.inventory?.totalUnits || 5,
            minStockAlert: product.inventory?.minStockAlert || 1
          });
          if (product.productImageUrl) {
            setPreviewUrl(product.productImageUrl);
          }
        } catch (err) {
          console.error("Error loading product:", err);
          setError("שגיאה בטעינת נתוני המוצר");
        } finally {
          setInitialLoading(false);
        }
      };
      loadProduct();
    }
  }, [editing, productId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Basic product info
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('brand', formData.brand);
      submitData.append('condition', formData.condition);
      submitData.append('specifications', formData.specifications);
      submitData.append('tags', formData.tags);
      submitData.append('featured', formData.featured);
      
      // Inventory data
      submitData.append('totalUnits', formData.totalUnits);
      submitData.append('minStockAlert', formData.minStockAlert);

      // Image
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      let result;
      if (editing) {
        result = await updateProduct(productId, submitData);
      } else {
        result = await createProduct(submitData);
      }

      console.log("Product saved successfully:", result);
      navigate('/admin/products');

    } catch (err) {
      console.error("Save Error:", err);
      setError(editing ? 'שגיאה בעדכון המוצר' : 'שגיאה בהוספת המוצר');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="product-form-container-modern">
        <div className="loading-screen-modern">
          <LoadingSpinner />
          <h3>טוען נתוני מוצר...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form-container-modern">
      <div className="form-header-modern">
        <div className="header-content">
          <h1>{editing ? '✏️ עריכת מוצר' : '➕ הוספת מוצר חדש'}</h1>
          <p>{editing ? 'עדכן את פרטי המוצר והמלאי' : 'הוסף מוצר חדש עם ניהול מלאי מתקדם'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form-modern">
        {/* Basic Information Section */}
        <div className="form-section-modern">
          <div className="section-header">
            <h3>📋 מידע בסיסי</h3>
            <p>פרטי המוצר הבסיסיים</p>
          </div>
          
          <div className="form-grid-modern">
            <div className="form-group-modern">
              <label className="form-label-modern">שם המוצר *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input-modern"
                placeholder="הכנס שם מוצר..."
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">מחיר (₪) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="form-input-modern"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">קטגוריה *</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select-modern"
                required
              >
                <option value="">בחר קטגוריה...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">מותג</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="form-input-modern"
                placeholder="שם המותג..."
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">מצב המוצר</label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="form-select-modern"
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-modern featured-toggle">
              <label className="checkbox-label-modern">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="form-checkbox-modern"
                />
                <span className="checkmark-modern">
                  <StarIcon />
                </span>
                <span className="checkbox-text">מוצר מומלץ</span>
              </label>
            </div>
          </div>

          <div className="form-group-modern full-width">
            <label className="form-label-modern">תיאור המוצר</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-textarea-modern"
              placeholder="תאר את המוצר, התכונות שלו ופרטים נוספים..."
              rows="4"
            />
          </div>
        </div>

        {/* Inventory Management Section */}
        <div className="form-section-modern">
          <div className="section-header">
            <InventoryIcon />
            <div>
              <h3>📦 ניהול מלאי</h3>
              <p>הגדרות מלאי ויחידות זמינות</p>
            </div>
          </div>
          
          <div className="inventory-grid-modern">
            <div className="form-group-modern">
              <label className="form-label-modern">כמות יחידות במלאי *</label>
              <input
                type="number"
                value={formData.totalUnits}
                onChange={(e) => handleInputChange('totalUnits', parseInt(e.target.value) || 0)}
                className="form-input-modern"
                min="0"
                required
              />
              <small className="form-hint">מספר היחידות הכולל הזמין להשכרה</small>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">התראת מלאי נמוך</label>
              <input
                type="number"
                value={formData.minStockAlert}
                onChange={(e) => handleInputChange('minStockAlert', parseInt(e.target.value) || 1)}
                className="form-input-modern"
                min="0"
              />
              <small className="form-hint">התרעה כאשר המלאי מתחת לכמות זו</small>
            </div>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="form-section-modern">
          <div className="section-header">
            <h3>📝 פרטים נוספים</h3>
            <p>מפרטים וקטגוריות לחיפוש</p>
          </div>
          
          <div className="form-group-modern full-width">
            <label className="form-label-modern">מפרטים טכניים</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => handleInputChange('specifications', e.target.value)}
              className="form-textarea-modern"
              placeholder="מידות, משקל, הספק, וכל פרט טכני רלוונטי..."
              rows="3"
            />
          </div>

          <div className="form-group-modern full-width">
            <label className="form-label-modern">תגיות לחיפוש</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="form-input-modern"
              placeholder="תגיות מופרדות בפסיק (למשל: חשמלי, ניידת, פנים..."
            />
            <small className="form-hint">תגיות אלו יעזרו ללקוחות למצוא את המוצר בחיפוש</small>
          </div>
        </div>

        {/* Image Section */}
        <div className="form-section-modern">
          <div className="section-header">
            <ImageIcon />
            <div>
              <h3>🖼️ תמונת המוצר</h3>
              <p>העלה תמונה איכותית של המוצר</p>
            </div>
          </div>
          
          <div className="image-upload-section-modern">
            <div className="image-upload-area">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input-hidden"
              />
              <label htmlFor="image-upload" className="image-upload-label">
                {previewUrl ? (
                  <div className="image-preview-container">
                    <img src={previewUrl} alt="תצוגה מקדימה" className="image-preview" />
                    <div className="image-overlay">
                      <ImageIcon />
                      <span>לחץ להחלפת תמונה</span>
                    </div>
                  </div>
                ) : (
                  <div className="image-placeholder">
                    <ImageIcon />
                    <span>לחץ להעלאת תמונה</span>
                    <small>PNG, JPG עד 5MB</small>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message-modern">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions-modern">
          <button
            type="submit"
            disabled={loading}
            className="submit-btn-modern"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>{editing ? 'שומר שינויים...' : 'שומר מוצר...'}</span>
              </>
            ) : (
              <>
                <SaveIcon />
                <span>{editing ? 'עדכן מוצר' : 'הוסף מוצר'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="cancel-btn-modern"
            disabled={loading}
          >
            <CancelIcon />
            <span>ביטול</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
