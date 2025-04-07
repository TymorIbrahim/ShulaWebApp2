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
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null); // holds logged in user details

  // Handler for successful login/sign-up
  const handleLogin = (userData) => {
    setUser(userData);
    console.log("User logged in:", userData);
  };

  // Fetch products when app loads
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
        {/* Navbar appears on all pages; pass the user and logout handler if needed */}
        <Navbar user={user} />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<HeroSection />} />
            <Route path="/products" element={<ProductGrid products={products} />} />
            {/* Pass the user prop to ProductDetails */}
            <Route path="/products/:productId" element={<ProductDetails user={user} />} />
            <Route path="/cart-page" element={<CartPage user={user} />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/about" element={<About />} />
            <Route path="/loginpage" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignIn onLogin={handleLogin} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
