// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// --- Service Imports ---
import { getProducts } from "./services/productService"; 

// --- Context Provider Imports ---
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import { CartProvider } from "./context/CartContext"; 

// --- Component Imports ---
import Navbar from "./components/Navbar"; 
import ProtectedRoute from "./components/ProtectedRoute"; 
import Footer from "./components/Footer";

// --- Layout Imports ---
import AdminLayout from "./layouts/AdminLayout"; 

// --- Page Imports ---
import HomePage from "./pages/HomePage"; 
import LoginPage from "./pages/LoginPage"; 
import SignupPage from "./pages/SignupPage"; 
// import OrderHistoryPage from "./pages/OrderHistoryPage"; // Temporarily commented out
import ProductGrid from "./components/ProductGrid"; 
import ProductDetails from "./components/ProductDetails";
import CartPage from "./components/CartPage";
import FAQs from "./components/FAQs";
import About from "./components/About";

// Admin Page Imports
import AdminDashboard from "./pages/AdminDashboard"; 
import ManageProducts from "./pages/ManageProducts";
import ProductForm from "./components/ProductForm"; 
// import ManageRentalsPage from "./pages/ManageRentalsPage"; // Temporarily commented out
import UserManagement from './pages/UserManagement';
import EditUserRoles from './pages/EditUserRoles';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminSettings from "./pages/AdminSettings";

import "./App.css"; // Main App CSS

// --- DEBUGGING: Log the type of each imported component ---
console.log("Type of Navbar:", typeof Navbar);
console.log("Type of ProtectedRoute:", typeof ProtectedRoute);
console.log("Type of Footer:", typeof Footer);
console.log("Type of AdminLayout:", typeof AdminLayout);
console.log("Type of HomePage:", typeof HomePage);
console.log("Type of LoginPage:", typeof LoginPage);
console.log("Type of SignupPage:", typeof SignupPage);
console.log("Type of ProductGrid:", typeof ProductGrid);
console.log("Type of ProductDetails:", typeof ProductDetails);
console.log("Type of CartPage:", typeof CartPage);
console.log("Type of FAQs:", typeof FAQs);
console.log("Type of About:", typeof About);
console.log("Type of AdminDashboard:", typeof AdminDashboard);
console.log("Type of ManageProducts:", typeof ManageProducts);
console.log("Type of ProductForm:", typeof ProductForm);
console.log("Type of UserManagement:", typeof UserManagement);
console.log("Type of EditUserRoles:", typeof EditUserRoles);
console.log("Type of AnalyticsDashboard:", typeof AnalyticsDashboard);
console.log("Type of AdminSettings:", typeof AdminSettings);
// --- END DEBUGGING ---

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContentWrapper /> {/* Wrapper to use useLocation */}
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

// Wrapper component to use useLocation hook
const AppContentWrapper = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth(); 
  
  const isUserActuallyAdmin = user &&
                           user.role &&
                           typeof user.role.includes === 'function' &&
                           user.role.includes('staff');
  
  const isAdminPage = location.pathname.startsWith('/admin');

  // console.log("[AppContentWrapper] Path:", location.pathname, "isAdminPage based on path:", isAdminPage, "User object:", JSON.stringify(user, null, 2) ,"User isUserActuallyAdmin (local check):", isUserActuallyAdmin, "User isAuthenticated:", isAuthenticated);

  return (
    <AppContent 
      isAdminPage={isAdminPage} 
      isAuthenticated={isAuthenticated}
      isUserAdmin={isUserActuallyAdmin} 
    />
  );
};

const AppContent = ({ isAdminPage, isAuthenticated, isUserAdmin }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products in AppContent:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {!isAdminPage && <Navbar />}
      
      <Routes>
        {/* === Public and Standard User Routes === */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductGrid products={products} />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/cart-page" 
          element={isAuthenticated ? <CartPage /> : <Navigate to="/login" state={{ from: {pathname: '/cart-page'} }} replace />} 
        />
        {/* Temporarily commented out route for OrderHistoryPage */}
        {/* <Route 
          path="/order-history" 
          element={isAuthenticated ? <OrderHistoryPage /> : <Navigate to="/login" state={{ from: {pathname: '/order-history'} }} replace />} 
        /> */}
        
        {/* === Protected Admin Routes === */}
        <Route element={<ProtectedRoute />}> 
          <Route element={<AdminLayout />}> 
            <Route path="/admin" element={<AdminDashboard />} /> 
            <Route path="/admin/products" element={<ManageProducts />} />
            <Route path="/admin/products/new" element={<ProductForm isEditing={false} />} />
            <Route path="/admin/products/edit/:productId" element={<ProductForm isEditing={true} />} />
            {/* Temporarily commented out route for ManageRentalsPage */}
            {/* <Route path="/admin/rentals" element={<ManageRentalsPage />} /> */}
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/:userId/edit-roles" element={<EditUserRoles />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
        
      </Routes>
      
      {!isAdminPage && <Footer />}
    </>
  );
}

export default App;
