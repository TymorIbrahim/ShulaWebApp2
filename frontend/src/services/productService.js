//C:\Users\User\ShulaWebApp2\frontend\src\services\productService.js
import axios from "axios";

const API_URL = "http://localhost:5002/api/products";

// Fetch all products
export const getProducts = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; // Ensure we return the array of products
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

// Fetch a single product by its ID
export const getProduct = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product details:", error);
        throw error;
    }
};

// Delete a product by ID
export const deleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };