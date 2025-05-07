// src/components/ProductForm.js
import React, { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProduct, getProducts } from "../services/productService"; // ייבוא השירות
import './ProductForm.css';

const ProductForm = ({ isEditing = false }) => {
  const { productId } = useParams();
  const editing = Boolean(productId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('Available');
  const [conditionNotes, setConditionNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [category, setCategory] = useState(''); // 🆕 הוספת סטייט
  const [categoriesList, setCategoriesList] = useState([]);
  const [addingNewCat, setAddingNewCat] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  
  const navigate = useNavigate();

    // when editing, load existing product
    useEffect(() => {
       // fetch existing categories
     getProducts().then(all => {
      const uniq = Array.from(new Set(all.map(p => p.category).filter(c => !!c)));
      setCategoriesList(uniq);
      });
      if (editing) {
        getProduct(productId)
          .then(prod => {
            setName(prod.name);
            setDescription(prod.description);
            setPrice(prod.price);
            setCategory(prod.category);
            setStatus(prod.available ? 'Available' : 'Maintenance');
            setConditionNotes(prod.conditionNotes || '');
            if (prod.productImageUrl) setPreviewUrl(prod.productImageUrl);
          })
          .catch(console.error);
      }
    }, [editing, productId]);

    
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
    // if admin typed a brand‑new category, use that
      const finalCategory = addingNewCat && newCategory
        ? newCategory.trim()
        : category;

    setError('');
    setLoadingSubmit(true);
  
    try {
      const formData = new FormData();
      formData.append('category', finalCategory);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('status', status);
      formData.append('conditionNotes', conditionNotes);
      if (imageFile) {
        formData.append('image', imageFile);
      }
  
      let productResult;
       if (editing) {
         productResult = await updateProduct(productId, formData);
       } else {
         productResult = await createProduct(formData);
      }

      console.log("Product added successfully:", productResult);
  
      alert(editing ? 'המוצר עודכן בהצלחה!' : 'המוצר נוסף בהצלחה!');
      
      navigate('/admin/products');
    } catch (err) {
      console.error("Save Error:", err);
          setError(
              editing
                ? 'שגיאה בעדכון מוצר. בדוק את הקונסול.'
                : 'שגיאה בהוספת מוצר. בדוק את הקונסול.'
            );
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>{isEditing ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>

      <div className="form-group">
        <label htmlFor="name">שם:</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="description">תיאור:</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="price">מחיר (₪):</label>
        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" />
      </div>

      <div className="form-group">
        <label htmlFor="category">קטגוריה:</label>
           {!addingNewCat ? (
            <select
              id="category"
              value={category}
              onChange={e => {
                if (e.target.value === "__new__") {
                  setAddingNewCat(true);
                  setCategory("");
                } else {
                  setCategory(e.target.value);
                }
              }}
              required
            >      <option value="" disabled>בחר קטגוריה…</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__new__">+ הוסף קטגוריה חדשה</option>
            </select>
          ) : (
            <input
              type="text"
              id="newCategory"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="הקלד קטגוריה חדשה"
              required
            />
          )}

      </div>

      <div className="form-group">
        <label htmlFor="status">סטטוס:</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Available">זמין</option>
          <option value="Rented">בהשאלה</option>
          <option value="Maintenance">בתיקון</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="conditionNotes">הערות למצב:</label>
        <textarea id="conditionNotes" value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="image">תמונה:</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
        {previewUrl && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={previewUrl}
              alt="תצוגת תמונה"
              style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
            />
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="form-buttons">
       <button
         type="submit"
         disabled={loadingSubmit}
        className="admin-button submit-button"
        >
         {loadingSubmit
           ? (editing ? 'שומר שינויים...' : 'שומר...')
             : (editing ? 'עדכן מוצר'        : 'הוסף מוצר')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="admin-button cancel-button"
          disabled={loadingSubmit}
        >
          ביטול
        </button>
      </div>
    </form>
  );
};



export default ProductForm;
