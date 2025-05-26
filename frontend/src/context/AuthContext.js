// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Effect to load user from localStorage on initial mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user"); // Clear corrupted item
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const loginUser = (userData) => {
    if (!userData || typeof userData !== 'object') {
      console.error("Invalid userData provided to loginUser");
      return;
    }
    
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      if (!authReady) setAuthReady(true);
    } catch (error) {
      console.error("Could not save user to localStorage:", error);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Effect to listen for storage changes (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "user") {
        try {
          const storedUser = localStorage.getItem("user");
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user from storage event:", error);
          setUser(null);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, loginUser, logoutUser, authReady } = context;

  // Calculate admin status
  let calculatedIsAdmin = false;
  if (authReady && user && typeof user === 'object' && user.hasOwnProperty('role')) {
    calculatedIsAdmin = user.role === 'staff';
  }

  return {
    user,
    loginUser,
    logoutUser,
    isAuthenticated: !!user,
    isAdmin: calculatedIsAdmin,
    authReady,
  };
};
