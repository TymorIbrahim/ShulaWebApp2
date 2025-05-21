// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initialize user to null
  const [authReady, setAuthReady] = useState(false); // New state: true when initial auth check is done

  // Effect to load user from localStorage on initial mount
  useEffect(() => {
    console.log("[AUTH_CONTEXT_PROVIDER_V5] Initializing: Attempting to load user from localStorage...");
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("[AUTH_CONTEXT_PROVIDER_V5] Initializing: User loaded from localStorage:", JSON.stringify(parsedUser, null, 2));
      } else {
        console.log("[AUTH_CONTEXT_PROVIDER_V5] Initializing: No user found in localStorage.");
      }
    } catch (error) {
      console.error("[AUTH_CONTEXT_PROVIDER_V5] Initializing: Error parsing user from localStorage:", error);
      localStorage.removeItem("user"); // Clear corrupted item
      setUser(null);
    } finally {
      setAuthReady(true); // Signal that initial auth check is complete
      console.log("[AUTH_CONTEXT_PROVIDER_V5] Initializing: Auth check complete, authReady set to true.");
    }
  }, []); // Empty dependency array means this runs once on mount

  const loginUser = (userData) => {
    console.log("======================================================");
    console.log("[AUTH_CONTEXT_PROVIDER_V5] loginUser called with userData:", JSON.stringify(userData, null, 2));
    if (!userData || typeof userData !== 'object') {
      console.error("[AUTH_CONTEXT_PROVIDER_V5] loginUser ERROR: Invalid userData provided. Not setting user.");
      return;
    }
    if (userData.hasOwnProperty('role')) {
        console.log("[AUTH_CONTEXT_PROVIDER_V5] loginUser INFO: userData has 'role' property. Value:", JSON.stringify(userData.role));
    } else {
        console.warn("[AUTH_CONTEXT_PROVIDER_V5] loginUser WARNING: userData does NOT have 'role' property.");
    }
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData); // Set user
      // authReady should already be true, but setting user might trigger re-renders that need it.
      if (!authReady) setAuthReady(true);
      console.log("[AUTH_CONTEXT_PROVIDER_V5] loginUser SUCCESS: User set in state and localStorage.");
    } catch (error) {
      console.error("[AUTH_CONTEXT_PROVIDER_V5] loginUser ERROR: Could not stringify or set user in localStorage.", error);
    }
    console.log("======================================================");
  };

  const logoutUser = () => {
    console.log("[AUTH_CONTEXT_PROVIDER_V5] logoutUser called.");
    localStorage.removeItem("user");
    setUser(null); // Clear user
    // authReady remains true, just no user is authenticated.
    console.log("[AUTH_CONTEXT_PROVIDER_V5] logoutUser SUCCESS: User removed from state and localStorage.");
  };

  // Effect to listen for storage changes (for multi-tab sync) - Optional but good
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "user") {
        console.log("[AUTH_CONTEXT_PROVIDER_V5] Storage event detected for 'user' key.");
        try {
          const storedUser = localStorage.getItem("user");
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          setUser(parsedUser);
          console.log("[AUTH_CONTEXT_PROVIDER_V5] User state updated from storage event. New user:", JSON.stringify(parsedUser, null, 2));
        } catch (error) {
          console.error("[AUTH_CONTEXT_PROVIDER_V5] Error parsing user from storage event", error);
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

  console.log("------------------------------------");
  console.log("[USE_AUTH_HOOK_V5] Hook called.");
  console.log("[USE_AUTH_HOOK_V5] authReady from context:", authReady);
  console.log("[USE_AUTH_HOOK_V5] Current user object from context:", JSON.stringify(user, null, 2));

  let calculatedIsAdmin = false;
  if (authReady && user && typeof user === 'object' && user.hasOwnProperty('role') && user.role && typeof user.role.includes === 'function') {
    console.log("[USE_AUTH_HOOK_V5] User object has 'role' and role has 'includes' method. Role value:", JSON.stringify(user.role));
    console.log("[USE_AUTH_HOOK_V5] Type of user.role:", typeof user.role);
    if (user.role.includes("staff")) {
      console.log("[USE_AUTH_HOOK_V5] user.role INCLUDES 'staff'.");
      calculatedIsAdmin = true;
    } else {
      console.log("[USE_AUTH_HOOK_V5] user.role does NOT include 'staff'.");
    }
  } else if (authReady && user) {
    console.log("[USE_AUTH_HOOK_V5] User object is present, but 'role' property is missing, falsy, or not suitable. Role value:", user.hasOwnProperty('role') ? JSON.stringify(user.role) : "Role property missing");
  } else if (authReady) {
    console.log("[USE_AUTH_HOOK_V5] Auth is ready, but no user object present.");
  } else {
    console.log("[USE_AUTH_HOOK_V5] Auth is NOT ready yet (authReady is false).");
  }
  console.log("[USE_AUTH_HOOK_V5] FINAL calculated isAdmin value:", calculatedIsAdmin);
  console.log("------------------------------------");

  return {
    user,
    loginUser,
    logoutUser,
    isAuthenticated: !!user,
    isAdmin: calculatedIsAdmin,
    authReady, // Expose authReady
  };
};
