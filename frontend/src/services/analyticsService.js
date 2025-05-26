// src/services/analyticsService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";
const API_URL = `${API_BASE_URL}/api/analytics`;

export const getTotalOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders/total`);
    return response.data.totalOrders;
  } catch (error) {
    console.error('Error fetching total orders:', error);
    throw error;
  }
};

export const getTotalRevenue = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders/revenue`);
    return response.data.totalRevenue;
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    throw error;
  }
};

export const getRecentOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export const getPopularProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/popular`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};