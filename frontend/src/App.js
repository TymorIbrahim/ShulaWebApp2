import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getProducts } from "./services/productService";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection"; // Home page component
import ProductGrid from "./components/ProductGrid"; // Products listing component
import ProductDetails from "./components/ProductDetails"; // Product details page
import CartPage from "./components/CartPage"; // Cart page component
import FAQs from "./components/FAQs";
import About from "./components/About";
import LoginPage from "./components/LoginPage";
import SignIn from "./components/SignIn";
import AdminSettings from "./pages/AdminSettings";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [userRole, setUserRole] = useState(null);

  // Example login handler, which sets the user role
  const handleLogin = (role) => {
    setUserRole(role);
    console.log("User logged in as:", role);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        console.log("Fetched products:", data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Router>
      <div className="app-container">
        {/* Navbar appears on all pages */}
        <Navbar />
        <div className="content-wrapper">
          <Routes>
            {/* Home page route */}
            <Route path="/" element={<HeroSection />} />

            {/* Products grid route */}
            <Route path="/products" element={<ProductGrid products={products} />} />

            {/* Product details route, uses URL parameter */}
            <Route path="/products/:productId" element={<ProductDetails />} />

            {/* Cart page route */}
            <Route path="/cart-page" element={<CartPage />} />

            {/* FAQs page */}
            <Route path="/faqs" element={<FAQs />} />

            {/* About page */}
            <Route path="/about" element={<About />} />

            {/* Login page route */}
            <Route path="/loginpage" element={<LoginPage onLogin={handleLogin} />} />

            {/* Sign-up page route */}
            <Route path="/signup" element={<SignIn />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
