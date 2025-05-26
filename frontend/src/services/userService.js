// src/services/userService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";
const API_URL = `${API_BASE_URL}/api/users`;

// Helper to get auth headers
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token || user.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Enhanced getUsers with pagination, search, filtering, and sorting
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL;
    console.log('👥 [UserService] Fetching users with URL:', url);
    
    const headers = getAuthHeaders();
    console.log('👥 [UserService] Using headers:', headers);
    
    const response = await axios.get(url, { headers });
    console.log('👥 [UserService] API Response received:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ [UserService] Error fetching users:', error);
    console.error('❌ [UserService] Error response:', error.response?.data);
    console.error('❌ [UserService] Error status:', error.response?.status);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/${userId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(`${API_URL}/${userId}`, userData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_URL}/${userId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Helper functions for user management
export const getRoleBadge = (role) => {
  switch (role) {
    case 'staff':
      return { 
        label: 'צוות', 
        color: '#3b82f6',
        bgColor: '#dbeafe',
        icon: '👑'
      };
    case 'customer':
      return { 
        label: 'לקוח', 
        color: '#059669',
        bgColor: '#d1fae5',
        icon: '👤'
      };
    default:
      return { 
        label: 'לא מוגדר', 
        color: '#6b7280',
        bgColor: '#f3f4f6',
        icon: '❓'
      };
  }
};

export const getSignUpMethodBadge = (method) => {
  switch (method) {
    case 'local':
      return {
        label: 'רישום רגיל',
        color: '#059669',
        icon: '📧'
      };
    case 'google':
      return {
        label: 'Google',
        color: '#dc2626',
        icon: '🔍'
      };
    default:
      return {
        label: 'לא ידוע',
        color: '#6b7280',
        icon: '❓'
      };
  }
};

export const getUserStatusBadge = (user) => {
  const now = new Date();
  const createdAt = new Date(user.createdAt);
  const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  
  if (daysSinceCreation <= 7) {
    return {
      label: 'חדש',
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      icon: '🌟'
    };
  } else if (user.orderCount > 0) {
    return {
      label: 'פעיל',
      color: '#059669',
      bgColor: '#d1fae5',
      icon: '✅'
    };
  } else {
    return {
      label: 'לא פעיל',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: '⏸️'
    };
  }
};

export const formatUserName = (user) => {
  if (!user) return 'משתמש לא ידוע';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'ללא שם';
};

export const formatJoinDate = (dateString) => {
  if (!dateString) return 'לא ידוע';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'תאריך לא תקין';
    
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'שגיאת תאריך';
  }
};

export const getRelativeJoinTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays < 1) return 'היום';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    if (diffMonths < 12) return `לפני ${diffMonths} חודשים`;
    return `לפני ${diffYears} שנים`;
  } catch (error) {
    return formatJoinDate(dateString);
  }
};