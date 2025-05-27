// src/services/orderService.js
import axios from "axios";

// Base API URL - will use environment variable if available, otherwise default to production
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";
const API_BASE_URL_ORDERS = `${API_BASE_URL}/api/orders`;

const ADMIN_API_BASE_URL = `${API_BASE_URL}/api/admin/orders`;

// --- Function to get availability data for a product (enhanced with inventory awareness) ---
export const getProductAvailability = async (productId, token) => {
  try {
    const url = `${API_BASE_URL_ORDERS}/availability?productId=${productId}`;
    
    const config = token ? {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } : {};
    
    console.log("Fetching product availability from:", url);
    const response = await axios.get(url, config);
    console.log("Received availability data:", response.data);
    return response.data; // Returns full availability object with inventory details
  } catch (error) {
    console.error("Error fetching product availability in orderService:", error);
    if (error.response) {
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
    } else if (error.request) {
        console.error("Error request:", error.request);
    } else {
        console.error('Error message:', error.message);
    }
    return {
      productId: productId,
      totalInventoryUnits: 1,
      availabilityByDate: [],
      fullyBookedDates: [],
      message: "Error fetching availability"
    }; // Return fallback object on failure
  }
};

// --- Function to get booked dates for a product (backward compatibility) ---
export const getBookedDates = async (productId, token) => {
  try {
    // Use the new availability endpoint but return only fully booked dates for backward compatibility
    const availabilityData = await getProductAvailability(productId, token);
    return availabilityData.fullyBookedDates || []; // Return only fully booked dates
  } catch (error) {
    console.error("Error fetching booked dates in orderService:", error);
    return []; // Return empty array on failure to prevent crashes in consuming components
  }
};

// --- Function to validate if a booking is possible for specific dates ---
export const validateBooking = async (productId, startDate, endDate, token) => {
  try {
    const url = `${API_BASE_URL_ORDERS}/validate-booking`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    const data = {
      productId,
      startDate,
      endDate
    };
    
    console.log("Validating booking:", data);
    const response = await axios.post(url, data, config);
    console.log("Booking validation result:", response.data);
    return response.data; // Returns validation result with availability info
  } catch (error) {
    console.error("Error validating booking in orderService:", error);
    if (error.response) {
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        // Return the error response data if available
        return error.response.data;
    }
    return {
      isAvailable: false,
      message: "Network error occurred while validating booking"
    }; // Return fallback object on failure
  }
};

// --- Function to create a new order ---
export const createOrder = async (orderData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Assuming token-based auth
      },
    };
    // POST to the general /api/orders endpoint (or your specific create order endpoint)
    const response = await axios.post(`${API_BASE_URL_ORDERS}/`, orderData, config);
    return response.data;
  } catch (error) {
    console.error("Error creating order in orderService:", error.response ? error.response.data : error.message);
    // Rethrow a more specific error or the error data itself
    throw error.response ? error.response.data : new Error("Server error occurred while creating order.");
  }
};

// --- Admin function to get paginated orders with search and filters ---
export const getOrdersAsAdmin = async (token, params = {}) => {
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`, // Send token for protected admin route
      },
    };
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Set defaults and add parameters
    queryParams.append('page', params.page || 1);
    queryParams.append('limit', params.limit || 12);
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.quickFilter) queryParams.append('quickFilter', params.quickFilter);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // GET from the /api/admin/orders endpoint with query parameters
    const response = await axios.get(`${ADMIN_API_BASE_URL}?${queryParams.toString()}`, config);
    return response.data; // Returns { orders: [...], pagination: {...} }
  } catch (error) {
    console.error("Error fetching paginated orders for admin in orderService:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Server error occurred while fetching orders.");
  }
};

// --- Legacy function for backwards compatibility ---
export const getAllOrdersAsAdmin = async (token) => {
  console.warn("getAllOrdersAsAdmin is deprecated. Use getOrdersAsAdmin with pagination instead.");
  
  try {
    // Get all orders by fetching multiple pages
    let allOrders = [];
    let currentPage = 1;
    let hasMoreData = true;
    
    while (hasMoreData) {
      const response = await getOrdersAsAdmin(token, { 
        page: currentPage, 
        limit: 50 // Large page size for legacy compatibility
      });
      
      allOrders = allOrders.concat(response.orders);
      hasMoreData = response.pagination.hasNextPage;
      currentPage++;
      
      // Safety check to prevent infinite loops
      if (currentPage > 100) {
        console.warn("getAllOrdersAsAdmin: Stopped fetching after 100 pages to prevent infinite loop");
        break;
      }
    }
    
    return allOrders;
  } catch (error) {
    console.error("Error in getAllOrdersAsAdmin legacy function:", error);
    throw error;
  }
};

// --- Admin function to update order status ---
export const updateOrderStatusAsAdmin = async (orderId, status, token, changedBy = 'Unknown Staff', notes = '') => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    const body = JSON.stringify({ status, changedBy, notes });
    // PUT to the /api/admin/orders/:id endpoint (matches our backend route)
    const response = await axios.put(`${ADMIN_API_BASE_URL}/${orderId}`, body, config);
    return response.data;
  } catch (error) {
    console.error(`Error updating order status for order ${orderId} in orderService:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Server error occurred while updating order status.");
  }
};

// --- NEW: Admin function to confirm order pickup ---
export const confirmOrderPickup = async (orderId, pickupData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    
    const response = await axios.post(`${ADMIN_API_BASE_URL}/${orderId}/confirm-pickup`, pickupData, config);
    return response.data;
  } catch (error) {
    console.error(`Error confirming pickup for order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Server error occurred while confirming pickup.");
  }
};

// --- NEW: Admin function to confirm order return with summary report ---
export const confirmOrderReturn = async (orderId, returnData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    
    const response = await axios.post(`${ADMIN_API_BASE_URL}/${orderId}/confirm-return`, returnData, config);
    return response.data;
  } catch (error) {
    console.error(`Error confirming return for order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Server error occurred while confirming return.");
  }
};

// --- NEW: Admin function to get order summary report ---
export const getOrderSummaryReport = async (orderId, token) => {
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    
    const response = await axios.get(`${ADMIN_API_BASE_URL}/${orderId}/summary-report`, config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching summary report for order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Server error occurred while fetching summary report.");
  }
};

// --- NEW: Admin function to get single order with full details ---
export const getOrderById = async (orderId, token) => {
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    
    const response = await axios.get(`${ADMIN_API_BASE_URL}/${orderId}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Server error occurred while fetching order.");
  }
};