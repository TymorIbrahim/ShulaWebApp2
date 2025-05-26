//C:\Users\User\ShulaWebApp2\frontend\src\services\productService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";
const API_URL = `${API_BASE_URL}/api/products`;

// Helper to get auth headers
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token || user.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Function to get all products with optional query filters
export const getProducts = async (queryParams = {}) => {
  try {
    // Build query string from parameters
    const searchParams = new URLSearchParams();
    
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
        searchParams.append(key, queryParams[key]);
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;
    
    const response = await axios.get(url);
    return response.data; // Should contain products array and pagination info
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Function to get a single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Function to create a new product (admin only)
export const createProduct = async (productData, token) => {
  try {
    const response = await axios.post(API_URL, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // For image uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Function to update a product (admin only)
export const updateProduct = async (id, productData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // For image uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Function to delete a product (admin only)
export const deleteProduct = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Function to update product inventory specifically
export const updateProductInventory = async (id, inventoryData, token) => {
  try {
    // Get the current product first
    const currentProduct = await getProductById(id);
    
    // Update only the inventory part
    const updatedProduct = {
      ...currentProduct,
      inventory: {
        ...currentProduct.inventory,
        ...inventoryData
      }
    };
    
    const response = await axios.put(`${API_URL}/${id}`, updatedProduct, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product inventory:", error);
    throw error;
  }
};

// Function to get product statistics for dashboard
export const getProductStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats/dashboard`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product statistics:", error);
    // Return default stats if API fails
    return {
      totalProducts: 0,
      totalCategories: 0,
      lowStockProducts: 0,
      totalInventoryValue: 0,
      categories: []
    };
  }
};

// Helper function to format price for display
export const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// Helper function to get stock status
export const getStockStatus = (product) => {
    const totalUnits = product.inventory?.totalUnits || 0;
    const minAlert = product.inventory?.minStockAlert || 1;
    
    if (totalUnits === 0) {
        return { status: 'out-of-stock', label: 'אזל מהמלאי', color: '#dc2626' };
    } else if (totalUnits <= minAlert) {
        return { status: 'low-stock', label: 'מלאי נמוך', color: '#f59e0b' };
    } else {
        return { status: 'in-stock', label: 'במלאי', color: '#059669' };
    }
};

// Helper function to get condition badge
export const getConditionBadge = (condition) => {
    const badges = {
        'Excellent': { label: 'מצוין', color: '#059669' },
        'Very Good': { label: 'טוב מאוד', color: '#0284c7' },
        'Good': { label: 'טוב', color: '#7c3aed' },
        'Fair': { label: 'בינוני', color: '#f59e0b' },
        'Needs Repair': { label: 'זקוק לתיקון', color: '#dc2626' }
    };
    return badges[condition] || badges['Good'];
};

// Alias for backward compatibility
export const getProduct = getProductById;