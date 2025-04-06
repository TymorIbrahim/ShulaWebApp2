import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Make sure Routes and Route are imported
import { getProducts } from "./services/productService";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection"; // Your Home Page component
import CartPage from "./components/CartPage"; // Your Home Page component
import ProductGrid from "./components/ProductGrid"; // Your Products Page component
import "./App.css"; // Global styles
import FAQs from "./components/FAQs";
import About from "./components/About";

function App() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getProducts();
            console.log("Fetched products:", data);
            setProducts(data);
        };
        fetchData();
    }, []);

    return (
        <Router>
            <div className="app-container">
                {/* Navbar outside Routes: shows on ALL pages */}
                <Navbar />

                {/* Content area where page changes based on route */}
                <div className="content-wrapper"> {/* Optional wrapper */}
                    <Routes> {/* Use Routes to define page routes */}
                        
                        {/* Route for the Home Page */}
                        <Route 
                            path="/"                             // When URL is "yourdomain.com/"
                            element={<HeroSection />}            // Show the HeroSection component
                        /> 

                        {/* Route for the Products Page */}
                        <Route 
                            path="/products"                    // When URL is "yourdomain.com/products"
                            element={<ProductGrid products={products} />} // Show the ProductGrid component
                        />
                        {/* Route for the Products Page */}
                        <Route 
                            path="/cart-page"                   
                            element={<CartPage />} 
                        />
                        <Route 
                            path="/faqs"                    
                            element={<FAQs />}
                        />
                         <Route 
                            path="/about"                    
                            element={<About />} 
                        />

                    </Routes>
                </div>

                {/* A Footer could go here, outside Routes, to show on all pages */}
            </div>
        </Router>
    );
}

export default App;