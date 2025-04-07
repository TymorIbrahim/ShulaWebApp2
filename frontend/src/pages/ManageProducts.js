import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/productService";
import { useNavigate } from "react-router-dom";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    const fetchAllProducts = async () => {
      const data = await getProducts();
      setProducts(data || []);
    };
    fetchAllProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("האם אתה בטוח שברצונך למחוק מוצר זה?");
    if (!confirmDelete) return;

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert("שגיאה במחיקת המוצר.");
      console.error(err);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleAdd = () => {
    navigate("/admin/add");
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="/admin/manage-products-page">
      <div className="top-bar">
       <h2>ניהול מוצרים</h2>
       <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
           type="text"
            placeholder="חפש מוצר לפי שם..."
           value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           style={{
             padding: "8px 12px",
             borderRadius: "6px",
             border: "1px solid #ccc",
             fontSize: "14px",
             direction: "rtl",
           }}
         />
        <button className="add-product-btn" onClick={() => navigate('/admin/products/new')}>
         ➕ הוסף מוצר חדש
        </button>

        </div>
      </div>
      <div className="product-list">
       {filteredProducts.map((product) => (

          <div className="product-card" key={product._id}>
            <img src={product.productImageUrl || "/placeholder.jpg"} alt={product.name} />
            <div className="info">
              <h3>{product.name}</h3>
              <p>{product.price} ₪</p>
            </div>
            <div className="actions">
              <button onClick={() => handleEdit(product._id)}>✏️ ערוך</button>
              <button onClick={() => handleDelete(product._id)}>🗑️ מחק</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;