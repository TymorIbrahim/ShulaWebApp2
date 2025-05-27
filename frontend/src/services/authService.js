import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";
const API_URL = `${API_BASE_URL}/api/auth`;

/**
 * Registers a new user.
 * @param {Object} userData - { firstName, lastName, email, phone, password }
 * @returns {Promise<Object>} - Returns response data containing the new user.
 */
export const signUp = async (userData) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  return response.data;
};

/**
 * Logs in an existing user.
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - Returns response data containing the user.
 */
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

/**
 * Returns auth headers for API requests
 * @param {string} token - JWT token
 * @returns {Object} - Headers object with Authorization
 */
export const getAuthHeaders = (token) => {
  if (!token) {
    return {};
  }
  
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};
