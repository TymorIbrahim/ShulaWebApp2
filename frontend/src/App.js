import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 

// --- Service Imports ---
import { getProducts } from "./services/productService";

// --- Context Provider Imports ---
import { AuthProvider } from "./context/AuthContext"; 
import { CartProvider } from "./context/CartContext"; 

// --- Component Imports (Public Facing & Shared) ---
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection"; 
import ProductGrid from "./components/ProductGrid"; 
import ProductDetails from "./components/ProductDetails";
import CartPage from "./components/CartPage"; 
import FAQs from "./components/FAQs"; // Assuming you have this component
import About from "./components/About"; // Assuming you have this component
import ProtectedRoute from './components/ProtectedRoute'; 
import ProductForm from './components/ProductForm'; // Assuming you created this

// --- Page Imports (Top Level Views) ---
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'
import AdminDashboard from './pages/AdminDashboard'; 
import ManageProducts from "./pages/ManageProducts";
import AdminSettings from "./pages/AdminSettings";
// import ManageRentals from "./pages/ManageRentals"; 

// --- CSS Imports ---
import "./App.css"; 

function App() {
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
        <Router> 
            <AuthProvider> 
                <CartProvider> 
                    <div className="app-container">
                        <Navbar /> 
                        <div className="content-wrapper"> 
                            <Routes> 
                                {/* === Public Routes === */}
                                <Route path="/" element={<HeroSection />} /> 
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
                                    <Route path="/admin" element={<AdminDashboard />} /> 
                                    <Route path="/admin/products" element={<ManageProducts />} />
                                    <Route path="/admin/products/new" element={<ProductForm isEditing={false} />} /> 
                                    <Route path="/admin/products/edit/:productId" element={<ProductForm isEditing={true} />} />
                                    <Route path="/admin/settings" element={<AdminSettings />} />
                                </Route>
                            </Routes>
                        </div>
                    </div>
                </CartProvider> 
            </AuthProvider> 
        </Router> 
    );
}

export default App;