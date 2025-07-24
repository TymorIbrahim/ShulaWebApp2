// src/services/cartService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";
const API_URL = `${API_BASE_URL}/api/carts`;

/**
 * Adds an item to the user's cart.
 * @param {Object} cartItemData - { user, product, rentalPeriod, quantity }
 * @param {string} token - User authentication token
 * @returns {Promise<Object>} - The API response.
 */
export const addToCart = async (cartItemData, token) => {
  const config = token ? {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  } : {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const response = await axios.post(`${API_URL}/add`, cartItemData, config);
  return response.data;
};
