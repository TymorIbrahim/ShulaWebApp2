// src/services/cartService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002/api/carts";

/**
 * Adds an item to the user's cart.
 * @param {Object} cartItemData - { user, product, rentalPeriod }
 * @returns {Promise<Object>} - The API response.
 */
export const addToCart = async (cartItemData) => {
  const response = await axios.post(`${API_URL}/add`, cartItemData);
  return response.data;
};
