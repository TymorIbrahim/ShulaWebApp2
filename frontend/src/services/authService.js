import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002/api/auth";

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
