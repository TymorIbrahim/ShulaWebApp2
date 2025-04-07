// src/services/orderService.js
import axios from "axios";

/**
 * Fetches the booked dates for a given product.
 * Assumes your backend API responds with an array of date strings (ISO format).
 *
 * @param {String} productId - The ID of the product.
 * @returns {Promise<String[]>} - A promise resolving to an array of date strings.
 */
export const getBookedDates = async (productId) => {
  try {
    const response = await axios.get(`/api/orders/booked-dates?productId=${productId}`);
    return response.data; // Adjust if your API wraps the data in an object
  } catch (error) {
    console.error("Error fetching booked dates:", error);
    return [];
  }
};
