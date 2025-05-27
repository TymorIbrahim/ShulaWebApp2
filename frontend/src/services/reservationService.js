import axios from 'axios';
import { getAuthHeaders } from './authService';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
const RESERVATION_API_URL = `${API_BASE_URL}/api/reservations`;

// Create a new reservation
export const createReservation = async (reservationData, token) => {
  try {
    const response = await axios.post(
      `${RESERVATION_API_URL}/create`,
      reservationData,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error.response?.data || error;
  }
};

// Extend reservation time
export const extendReservation = async (reservationId, additionalMinutes = 15, token) => {
  try {
    const response = await axios.put(
      `${RESERVATION_API_URL}/${reservationId}/extend`,
      { additionalMinutes },
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error extending reservation:', error);
    throw error.response?.data || error;
  }
};

// Cancel a reservation
export const cancelReservation = async (reservationId, token) => {
  try {
    const response = await axios.delete(
      `${RESERVATION_API_URL}/${reservationId}/cancel`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    throw error.response?.data || error;
  }
};

// Get user's reservations
export const getUserReservations = async (options = {}, token) => {
  try {
    const { status = 'active', limit = 10, page = 1 } = options;
    const params = new URLSearchParams({ status, limit, page });
    
    const response = await axios.get(
      `${RESERVATION_API_URL}/my?${params}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    throw error.response?.data || error;
  }
};

// Get reservations for a specific product (Admin only)
export const getProductReservations = async (productId, options = {}, token) => {
  try {
    const { status = 'active', startDate, endDate } = options;
    const params = new URLSearchParams({ status });
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(
      `${RESERVATION_API_URL}/product/${productId}?${params}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching product reservations:', error);
    throw error.response?.data || error;
  }
};

// Get reservation analytics (Admin only)
export const getReservationAnalytics = async (days = 30, token) => {
  try {
    const response = await axios.get(
      `${RESERVATION_API_URL}/analytics?days=${days}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching reservation analytics:', error);
    throw error.response?.data || error;
  }
};

// Cleanup expired reservations (Admin only)
export const cleanupExpiredReservations = async (token) => {
  try {
    const response = await axios.post(
      `${RESERVATION_API_URL}/cleanup`,
      {},
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error cleaning up reservations:', error);
    throw error.response?.data || error;
  }
};

// Enhanced availability checking with reservations
export const getEnhancedAvailability = async (productId, detailed = false, token = null) => {
  try {
    const config = token ? getAuthHeaders(token) : {};
    const params = new URLSearchParams({ productId });
    
    if (detailed) {
      params.append('detailed', 'true');
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/api/orders/availability?${params}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching enhanced availability:', error);
    throw error.response?.data || error;
  }
};

// Get real-time availability snapshot
export const getRealTimeAvailability = async (productId, token = null) => {
  try {
    const config = token ? getAuthHeaders(token) : {};
    const response = await axios.get(
      `${API_BASE_URL}/api/orders/availability/realtime?productId=${productId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching real-time availability:', error);
    throw error.response?.data || error;
  }
};

// Enhanced booking validation with reservations
export const validateBookingWithReservations = async (bookingData, token = null) => {
  try {
    const config = token ? getAuthHeaders(token) : {};
    const response = await axios.post(
      `${API_BASE_URL}/api/orders/validate-booking`,
      bookingData,
      config
    );
    return response.data;
  } catch (error) {
    console.error('Error validating booking:', error);
    throw error.response?.data || error;
  }
};

// Utility functions
export const formatReservationTime = (expiresAt) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const timeLeft = expiry - now;
  
  if (timeLeft <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(timeLeft / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${seconds}s`;
  }
};

export const getReservationStatus = (reservation) => {
  const now = new Date();
  const expiry = new Date(reservation.expiresAt);
  
  if (reservation.status !== 'active') {
    return reservation.status;
  }
  
  if (expiry <= now) {
    return 'expired';
  }
  
  const timeLeft = expiry - now;
  const minutesLeft = Math.floor(timeLeft / (1000 * 60));
  
  if (minutesLeft <= 2) {
    return 'expiring-soon';
  }
  
  return 'active';
}; 