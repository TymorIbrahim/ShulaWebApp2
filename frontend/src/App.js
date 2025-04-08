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
import FAQs from "./components/FAQs";
import About from "./components/About";
import ProtectedRoute from './components/ProtectedRoute';
import ProductForm from './components/ProductForm';
import Footer from './components/Footer'; // --- IMPORT FOOTER ---

// --- Page Imports (Top Level Views) ---
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from "./pages/ManageProducts";
import AdminSettings from "./pages/AdminSettings";
// import ManageRentals from "./pages/ManageRentals";

// --- CSS Imports ---
import "./App.css"; // Keep this for global component styles

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
                    {/* Navbar is outside main container for full width */}
                    <Navbar />

                    {/* Main content area where routes render */}
                    {/* Apply main-content-container INSIDE specific pages/routes OR use logic here */}
                    {/* For simplicity, assuming main-content-container is applied within each page component except Hero */}
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
                            {/* <Route path="/admin/rentals" element={<ManageRentals />} /> */}
                        </Route>

                         {/* Optional: Add a 404 Not Found Route */}
                         {/* <Route path="*" element={<NotFoundPage />} /> */}
                    </Routes>

                    {/* Footer is outside main content container for full width */}
                    <Footer /> {/* --- RENDER FOOTER --- */}

                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;