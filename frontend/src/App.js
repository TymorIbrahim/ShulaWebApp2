import React, { useEffect, useState } from "react";
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 

 // --- Service Imports ---
 import { getProducts } from "./services/productService";
 

 // --- Context Provider Imports ---
 import { AuthProvider, useAuth } from "./context/AuthContext";
 import { CartProvider } from "./context/CartContext";
 

 // --- Component Imports ---
 import Navbar from "./components/Navbar";
 import HeroSection from "./components/HeroSection";
 import ProductGrid from "./components/ProductGrid";
 import ProductDetails from "./components/ProductDetails";
 import CartPage from "./components/CartPage";
 import FAQs from "./components/FAQs";
 import About from "./components/About";
 import ProtectedRoute from "./components/ProtectedRoute";
 import ProductForm from "./components/ProductForm";
 import Footer from "./components/Footer";
 

 // --- Page Imports ---
 import LoginPage from "./pages/LoginPage";
 import SignupPage from "./pages/SignupPage";
 import AdminDashboard from "./pages/AdminDashboard";
 import ManageProducts from "./pages/ManageProducts";
 import AdminSettings from "./pages/AdminSettings";
 import UserManagement from './pages/UserManagement';
 import EditUserRoles from './pages/EditUserRoles';
 import AnalyticsDashboard from './pages/AnalyticsDashboard';
 

 // import ManageRentals from "./pages/ManageRentals";
 

 // --- CSS Imports ---
 import "./App.css";
 

 function App() {
  return (
  <Router>
  <AuthProvider>
  <CartProvider>
  <AppContent />
  </CartProvider>
  </AuthProvider>
  </Router>
  );
 }
 

 function AppContent() {
  const { user } = useAuth();  // ✅ Now safe to call here (inside AuthProvider)
  const [products, setProducts] = useState([]);
 

  useEffect(() => {
  const fetchData = async () => {
  try {
  const data = await getProducts();
  console.log("Fetched products:", data);
  setProducts(data);
  } catch (error) {
  console.error("Failed to fetch products:", error);
  }
  };
  fetchData();
  }, []);
 

  return (
  <>
  <Navbar />
 

  
  <Routes>
  {/* === Public Routes === */}
  {/* Hero route might render outside main-content-container */}
  <Route path="/" element={<HeroSection />} />
 

  {/* Other routes render within main-content-container (applied inside the component) */}
  <Route path="/products" element={<ProductGrid products={products} />} />
  <Route path="/cart-page" element={<CartPage />} />
  <Route path="/products/:productId" element={<ProductDetails />} />
  <Route path="/faqs" element={<FAQs />} />
  <Route path="/about" element={<About />} />
 

  {/* === Authentication Route === */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
 

  {/* === Protected Admin Routes === */}
  <Route element={<ProtectedRoute />}>
  {/* These components should also ideally wrap their content in .main-content-container */}
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/products" element={<ManageProducts />} />
  <Route path="/admin/products/new" element={<ProductForm isEditing={false} />} />
  <Route path="/admin/products/edit/:productId" element={<ProductForm isEditing={true} />} />
  <Route path="/admin/settings" element={<AdminSettings />} />
  <Route path="/admin/products/edit" element={<ManageProducts/>} />
  <Route path="/admin/users" element={<UserManagement />} />
  <Route path="/admin/users/:userId/edit-roles" element={<EditUserRoles />} />
  <Route path="/admin/analytics" element={<AnalyticsDashboard />} />  
  </Route>
  
  </Routes>
  <Footer />
  </>
  );
 }
 

 export default App;