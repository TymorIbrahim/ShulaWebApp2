import axios from "axios";

const API_URL = "http://localhost:5001/api/products";

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
