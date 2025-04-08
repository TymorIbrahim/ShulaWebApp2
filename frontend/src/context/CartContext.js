// src/context/CartContext.js
import React, { createContext, useState, useContext } from 'react';

// 1. Create the Context
const CartContext = createContext();

// 2. Create a Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // State to hold cart items

  // Function to add a product to the cart
  const addToCart = (productToAdd) => {
    console.log("CartContext: addToCart called with:", productToAdd); 

    // Check for the correct ID field (assuming _id from product data)
    if (!productToAdd || !productToAdd._id) { 
      console.error("CartContext: Product missing required ID field (_id)", productToAdd); 
      return; // Stop if the correct ID is missing
    }

    setCartItems((prevItems) => {
      console.log("CartContext: Previous cart items:", prevItems); 
      
      // Check if item exists using the correct ID field (_id)
      // Note: We are checking against item.id because we store it as 'id' below
      const existingItem = prevItems.find(item => item.id === productToAdd._id); 

      if (existingItem) {
        console.log(`${productToAdd.name} is already in the cart.`);
        // TODO: Implement quantity logic here if needed in the future
        // Example: return prevItems.map(item => item.id === productToAdd._id ? { ...item, quantity: item.quantity + 1 } : item);
        return prevItems; // Prevent adding duplicates for now
      } else {
        // Create a new item object for the cart, ensuring it has an 'id' property
        // Also copy other relevant details like name, price, imageUrl
        const newItem = {
            id: productToAdd._id, // Map _id to id
            name: productToAdd.name,
            price: productToAdd.price,
            imageUrl: productToAdd.productImageUrl // Assuming this is the field name
            // Add quantity if implementing: quantity: 1,
            // Add rental dates if implementing: rentalStartDate: productToAdd.rentalStartDate, rentalEndDate: productToAdd.rentalEndDate
        };
        const newItemArray = [...prevItems, newItem]; 
        console.log("CartContext: New cart items array:", newItemArray); 
        return newItemArray; 
      }
    });
  };

  // --- TODO: Add other functions later (e.g., removeFromCart, updateQuantity) ---
  // const removeFromCart = (productId) => { 
  //   console.log("CartContext: Removing item with id:", productId);
  //   setCartItems(prevItems => prevItems.filter(item => item.id !== productId)); 
  // };

  // Log the value being provided by the Provider whenever it renders
  console.log("CartContext: CartProvider rendering with cartItems:", cartItems);

  // Pass cartItems and functions via value prop
  return (
    <CartContext.Provider value={{ cartItems, addToCart /*, removeFromCart */ }}> 
      {children}
    </CartContext.Provider>
  );
};

// 3. Create a custom hook to use the Cart Context easily
export const useCart = () => {
  return useContext(CartContext);
};