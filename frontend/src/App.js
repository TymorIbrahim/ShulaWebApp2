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
import ProductDetails from "./components/ProductDetails";
import LoginPage from "./components/LoginPage";
import SignIn from "./components/SignIn";


function App() {
    const [products, setProducts] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const handleLogin = (role) => {
        setUserRole(role);
        console.log("User logged in as:", role);
      };

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
                            path="/"                             
                            element={<HeroSection />}            
                        /> 

                        {/* Route for the Products Page */}
                        <Route 
                            path="/products"                   
                            element={<ProductGrid products={products} />} 
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

                        <Route path="/loginpage"
                         element={<LoginPage onLogin={handleLogin} />}
                         />

                        <Route path="/signup" 
                        element={<SignIn />} 
                        />


                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;