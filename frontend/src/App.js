import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getProducts } from "./services/productService";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import "./App.css"; // Global styles

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
                {/* 🟢 Navigation Bar */}
                <Navbar />

                {/* 🎉 Hero Section */}
                <HeroSection />

                <div className="content-wrapper">
                    {/* 🛒 Product Grid */}
                    <Routes>
                        <Route path="/" element={<ProductGrid products={products} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
