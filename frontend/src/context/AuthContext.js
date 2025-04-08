// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Provider wraps your app so any component can access the authentication state
export const AuthProvider = ({ children }) => {
  // Initialize the user from localStorage if available, otherwise null.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // A function to log in the user globally.
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // A function to log out the user.
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Optionally, if you wish to automatically refresh the state from localStorage when needed
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing the auth context conveniently
export const useAuth = () => {
  return useContext(AuthContext);
};
