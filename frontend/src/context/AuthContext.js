// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

// 1. Create Context
const AuthContext = createContext(null); // Initialize with null

// 2. Create Provider
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage if available (basic persistence)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
      return localStorage.getItem('isAuthenticated') === 'true';
  }); 
  const [user, setUser] = useState(() => {
      const storedUser = localStorage.getItem('user');
      try {
          return storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
          return null; // Handle potential JSON parsing error
      }
  }); 
  
  const navigate = useNavigate(); // Hook for navigation (safe here as Provider is inside Router)

  // Update localStorage when auth state changes
  useEffect(() => {
      localStorage.setItem('isAuthenticated', isAuthenticated);
      if (isAuthenticated && user) {
          localStorage.setItem('user', JSON.stringify(user));
      } else {
          localStorage.removeItem('user');
      }
  }, [isAuthenticated, user]);


  // Function to login (replace with actual API call later)
  const login = async (username, password) => {
    console.log("AuthContext: Attempting login with:", username);
    // --- TODO: Replace with actual fetch call to your backend API ---
    // Example: const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({username, password}), headers: {'Content-Type': 'application/json'} }); 
    // const data = await response.json();
    // if (response.ok && data.token) { ... } 

    // --- Simulation for now ---
    // Use slightly more realistic dummy check
    if (username === 'manager@shula.com' && password === 'password123') { 
      console.log("AuthContext: Login successful (simulated)");
      const loggedInUser = { username: username, role: 'manager', id: 'admin1' }; // Example user object
      setIsAuthenticated(true);
      setUser(loggedInUser); 
      // Navigation logic moved to where login is called (e.g., LoginPage) for flexibility
      // navigate('/admin'); // Don't navigate automatically from context
      return true; // Indicate success
    } else {
      console.log("AuthContext: Login failed (simulated)");
      setIsAuthenticated(false);
      setUser(null);
      // Clear localStorage on failed login attempt too
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      return false; // Indicate failure
    }
  };

  // Function to logout
  const logout = () => {
    console.log("AuthContext: Logging out");
    // --- TODO: Call backend logout API if necessary (e.g., invalidate token) ---
    setIsAuthenticated(false);
    setUser(null);
    // Clear localStorage on logout
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login'); // Redirect to login page after logout
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
      isAuthenticated,
      user,
      login,
      logout
  }), [isAuthenticated, user]); // Dependencies for memoization

  console.log("AuthContext: AuthProvider rendering. isAuthenticated:", isAuthenticated);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook to use context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
      throw new Error("useAuth must be used within an AuthProvider");
  }
  if (context === undefined) { // Added check for undefined, potentially during initial render cycle
      console.warn("AuthContext value is undefined. Ensure AuthProvider wraps the component calling useAuth.");
      // Return a default structure or handle appropriately
      return { isAuthenticated: false, user: null, login: async () => false, logout: () => {} };
  }
  return context;
};