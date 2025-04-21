// src/services/orderService.js
import axios from "axios";

// Define the base URL (consider using environment variables for flexibility)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002/api/orders";


export const getBookedDates = async (productId) => {
  try {
    // Construct the full URL
    const url = `${API_URL}/booked-dates?productId=${productId}`;
    console.log("Fetching booked dates from:", url); // Add logging for debugging
    const response = await axios.get(url);
    console.log("Received booked dates:", response.data); // Log the received data
    return response.data; // Should be ['YYYY-MM-DD', ...]
  } catch (error) {
    console.error("Error fetching booked dates:", error);
     // Log more details about the error
     if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
    }
    return []; // Return empty array on failure
  }
};