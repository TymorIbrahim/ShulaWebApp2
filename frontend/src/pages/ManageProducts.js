// src/pages/ManageProducts.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Assuming you create this service file and functions
import { getAdminProducts, deleteAdminProduct } from '../services/adminService'; 
// import './ManageProducts.css'; // Create CSS for styling

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch products (can be called on mount and after delete)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      // Call the service function to get admin products
      const data = await getAdminProducts(); // Replace with REAL API call
      // Ensure data has the 'id' field needed for the table key/actions
      // This mapping assumes the service returns items with '_id' and we want 'id'
      const formattedData = data.map(p => ({ ...p, id: p._id || p.id })); 
      setProducts(formattedData);
    } catch (err) {
      setError('Failed to fetch products. Please ensure backend is running and API exists.');
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array means run once on mount

  // Handle delete button click
  const handleDelete = async (productId, productName) => {
    // Confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${productName}" (ID: ${productId})? This action cannot be undone.`)) {
      try {
        setError(''); // Clear previous errors
        // Call the service function to delete the product via API
        await deleteAdminProduct(productId); // Replace with REAL API call
        alert(`Product "${productName}" deleted successfully (simulation).`);
        // Refetch the product list to show the change
        fetchProducts(); 
      } catch (err) {
        setError('Failed to delete product. Please check console.');
        console.error("Delete Error:", err);
        alert(`Error deleting product: ${err.message}`); // Show error to user
      }
    }
  };

  // --- Render Logic ---

  if (loading) return <p>Loading products...</p>;
  // Display error more prominently
  if (error) return <p style={{ color: 'red', fontWeight: 'bold' }}>ERROR: {error}</p>;

  return (
    <div className="manage-products-container"> {/* Add styles for this container */}
      <h2>Manage Inventory</h2>
      
      <div style={{ marginBottom: '20px' }}> {/* Add space below button */}
        <Link to="/admin/products/new" className="admin-button add-product-button"> 
          + Add New Product
        </Link>
      </div>

      {/* Table to display products */}
      <table className="admin-table"> {/* Add styles for this table */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price (₪)</th>
            <th>Status</th>
            <th>Condition Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Check if products array exists and has items */}
          {products && products.length > 0 ? (
            products.map(product => (
              <tr key={product.id}> {/* Use consistent 'id' */}
                <td>{product.id}</td> 
                <td>{product.name || 'N/A'}</td>
                <td>{product.price ?? 'N/A'}</td>
                <td>{product.status || 'N/A'}</td>
                <td>{product.conditionNotes || 'N/A'}</td>
                <td className="action-buttons"> {/* Class for easier styling */}
                  <Link 
                    to={`/admin/products/edit/${product.id}`} 
                    className="admin-button edit-button" 
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(product.id, product.name)}
                    className="admin-button delete-button" 
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            // Message when no products are found
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No products found. Add one!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProducts;