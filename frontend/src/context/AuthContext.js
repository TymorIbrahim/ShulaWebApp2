// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import websocketService from "../services/websocketService";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.token) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
        }
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (user && user.token) {
      websocketService.initialize(user.token);
    } else {
      websocketService.disconnect();
    }
    return () => {
      if (!user) {
        websocketService.disconnect();
      }
    };
  }, [user]);

  const loginUser = (userToStore) => {
    if (!userToStore || !userToStore.token || !userToStore._id) {
      console.error("Invalid user object passed to loginUser.", userToStore);
      return;
    }
    try {
      localStorage.setItem("user", JSON.stringify(userToStore));
      setUser(userToStore);
    } catch (error) {
      console.error("Could not save user to localStorage:", error);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser(null);
    websocketService.disconnect();
  };
  
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "user") {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, authReady, token: user?.token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    ...context,
    isAuthenticated: !!context.user,
    isAdmin: context.user?.role === 'staff',
  };
};
