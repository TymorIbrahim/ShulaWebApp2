import React, { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import "./ProductGrid.css";

const ProductGrid = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getProducts();
                console.log("Fetched products:", data);
                const filteredProducts = data.filter(product =>
                    product.productImageUrl &&
                    product.productImageUrl.startsWith("http") &&
                    product.productImageUrl.trim() !== ""
                );
                setProducts(filteredProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="product-grid-container">
            <h2 className="grid-title">המוצרים שלנו</h2>
            <div className="product-grid">
                {products.map((product) => (
                    <div key={product._id} className="product-card">
                        <div className="image-container">
                            <img
                                src={product.productImageUrl}
                                alt={product.name}
                                className="product-image"
                            />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-price">₪{product.price}</p>
                            <button className="buy-button">הוסף לסל</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;
