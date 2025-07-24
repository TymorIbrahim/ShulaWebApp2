// frontend/src/hooks/useCustomerProfile.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || "https://shula-rent-project-production.up.railway.app";

export const useCustomerProfile = () => {
  const { token, authReady, loginUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = useCallback(async (page = 1) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/users/profile?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data.user);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile data.';
      setError(errorMessage);
      console.error("Error fetching profile data:", err.response || err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authReady) {
      fetchProfile();
    }
  }, [authReady, fetchProfile]);

  const updateProfile = async (newProfileData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, newProfileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userToStore = {
        token,
        ...response.data.user
      };
      loginUser(userToStore);
      setProfileData(response.data.user);
      setSuccess('פרופיל עודכן בהצלחה!');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בעדכון הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  return {
    profileData,
    orders,
    pagination,
    loading,
    error,
    success,
    fetchProfile,
    updateProfile,
    setProfileData,
    setOrders,
    setSuccess,
    setError
  };
}; 