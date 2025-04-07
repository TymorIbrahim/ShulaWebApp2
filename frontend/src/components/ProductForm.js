// src/components/ProductForm.js 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Assume service functions exist for admin actions in 'adminService.js'
import { getAdminProductById, createAdminProduct, updateAdminProduct } from '../services/adminService'; 
import './ProductForm.css';

const ProductForm = ({ isEditing = false }) => {
  // Form field states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('Available'); // Default status
  const [conditionNotes, setConditionNotes] = useState('');
  const [imageFile, setImageFile] = useState(null); // State for the selected file object
  const [imageUrl, setImageUrl] = useState(''); // State for existing image URL (editing)

  // Component states
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false); // For submission process
  const [loadingFetch, setLoadingFetch] = useState(isEditing); // For fetching existing data

  const { productId } = useParams(); // Get product ID from URL if editing
  const navigate = useNavigate();

  // Fetch existing product data if editing
  useEffect(() => {
    if (isEditing && productId) {
      const fetchProduct = async () => {
        setLoadingFetch(true); // Start fetching loading state
        setError('');
        try {
          // Ensure this service function exists and works
          const product = await getAdminProductById(productId); 
          setName(product.name || '');
          setDescription(product.description || '');
          setPrice(product.price || '');
          setStatus(product.status || 'Available');
          setConditionNotes(product.conditionNotes || '');
          setImageUrl(product.productImageUrl || ''); // Store existing image URL
        } catch (err) { 
            setError('Failed to load product data for editing.'); 
            console.error(err);
        }
        setLoadingFetch(false); // End fetching loading state
      };
      fetchProduct();
    } else {
      setLoadingFetch(false); // Not editing, so not fetching
    }
  }, [isEditing, productId]); // Dependencies

  // Handle file input change
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        setImageFile(event.target.files[0]);
        // Optionally display a preview of the selected file
        const reader = new FileReader();
        reader.onloadend = () => {
             // You could set this to state to show a preview, e.g., setPreviewUrl(reader.result);
        }
        reader.readAsDataURL(event.target.files[0]);
        setImageUrl(''); // Clear existing image URL preview if new file is selected
    } else {
        setImageFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoadingSubmit(true); // Start saving loading state

    // Use FormData especially if uploading files
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('status', status);
    formData.append('conditionNotes', conditionNotes);
    // Only append image if a *new* file was selected
    if (imageFile) { 
      formData.append('image', imageFile); // Backend must be configured to handle file upload named 'image'
    } 
    // If editing and no new file, backend should handle keeping the old image

    try {
      if (isEditing) {
        // Ensure this service function exists and works
        await updateAdminProduct(productId, formData); 
        alert('Product updated successfully!');
      } else {
        // Ensure this service function exists and works
        await createAdminProduct(formData); 
        alert('Product added successfully!');
      }
      navigate('/admin/products'); // Navigate back to list after success
    } catch (err) {
      // Provide more specific error if possible from backend response
      setError(`Failed to save product: ${err.message || 'Please check console.'}`);
      console.error('Save Error:', err);
    } finally {
      setLoadingSubmit(false); // End saving loading state
    }
  };

  // Show loading state while fetching for edit mode
  if (loadingFetch) return <p>Loading product details...</p>;

  return (
    // Add a CSS class for styling the form container
    <form onSubmit={handleSubmit} className="product-form"> 
      <h2>{isEditing ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>

<div className="form-group">
  <label htmlFor="name">שם:</label>
  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required />
</div>

<div className="form-group">
  <label htmlFor="description">תיאור:</label>
  <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
</div>

<div className="form-group">
  <label htmlFor="price">מחיר (₪):</label>
  <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" />
</div>

<div className="form-group">
  <label htmlFor="status">סטטוס:</label>
  <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
    <option value="Available">זמין</option>
    <option value="Rented">בהשאלה</option>
    <option value="Maintenance">בתיקון</option>
  </select>
</div>

<div className="form-group">
  <label htmlFor="conditionNotes">הערות למצב:</label>
  <textarea id="conditionNotes" value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} />
</div>

<div className="form-group">
  <label htmlFor="image">תמונה:</label>
  {isEditing && imageUrl && !imageFile && (
    <img src={imageUrl} alt="Current product" style={{ maxWidth: '100px', display: 'block', marginBottom: '10px' }} />
  )}
  <input type="file" id="image" onChange={handleImageChange} accept="image/*" />
  {imageFile && <p>הקובץ שנבחר: {imageFile.name}</p>}
</div>

{error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

<div className="form-buttons">
  <button type="submit" disabled={loadingSubmit || loadingFetch} className="admin-button submit-button">
    {loadingSubmit ? 'שומר...' : isEditing ? 'עדכן מוצר' : 'הוסף מוצר'}
  </button>
  <button type="button" onClick={() => navigate('/admin/products')} className="admin-button cancel-button" disabled={loadingSubmit}>
    ביטול
  </button>
</div>

    </form>
  );
};

export default ProductForm;