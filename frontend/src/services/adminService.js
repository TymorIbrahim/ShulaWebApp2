// src/services/adminService.js

// --- TODO: Replace these with actual fetch calls to your BACKEND API ---

const API_BASE_URL = '/api/admin'; // Example base URL for admin routes

// Function for ManageProducts.js
export const getAdminProducts = async () => {
  console.log("SERVICE: Fetching admin products (placeholder)...");
  // Replace with actual API call: const response = await fetch(`${API_BASE_URL}/products`, { headers: { /* Auth? */ } }); ...
  // Return dummy data matching ManageProducts expectations
  return [
    { id: 'prod_1', name: 'מכונת פופקורן', price: 25, status: 'Available', conditionNotes: 'Good' },
    { id: 'prod_2', name: 'ערכת רב פעמי', price: 10, status: 'Rented', conditionNotes: 'Missing 1 fork' },
    { id: 'prod_3', name: 'תוף חשמל 25 מטר', price: 10, status: 'Maintenance', conditionNotes: 'Check wiring' },
  ];
};

// Function for ManageProducts.js
export const deleteAdminProduct = async (productId) => {
  console.log(`SERVICE: Deleting product ${productId} (placeholder)...`);
  // Replace with actual API call: const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/products/</span>{productId}`, { method: 'DELETE', headers: { /* Auth? */ } }); ...
  if (Math.random() > 0.1) { // Simulate success most of the time
      return { success: true }; 
  } else {
      throw new Error('Simulated delete failure');
  }
};

// Function for ProductForm.js (when editing)
export const getAdminProductById = async (productId) => {
    console.log(`SERVICE: Fetching product ${productId} (placeholder)...`);
    // Replace with actual API call: const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/products/</span>{productId}`, { headers: { /* Auth? */ } }); ...
    // Return dummy data matching ProductForm expectations
    if (productId === 'prod_1') {
        return { id: 'prod_1', name: 'מכונת פופקורן', description: 'Makes great popcorn!', price: 25, status: 'Available', conditionNotes: 'Good' };
    }
    // Return defaults or throw error for other IDs in simulation
    return { id: productId, name: 'Sample Product', description: '', price: '10', status: 'Available', conditionNotes: '' }; 
};

// Function for ProductForm.js (when adding)
export const createAdminProduct = async (formData) => {
    console.log('SERVICE: Creating product (placeholder)...');
    // Log the data that would be sent
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    // Replace with actual API call: const response = await fetch(`${API_BASE_URL}/products`, { method: 'POST', body: formData, headers: { /* Auth? No Content-Type for FormData */ } }); ...
    // Simulate success
    return { success: true, id: `new_${Date.now()}` }; 
};

// Function for ProductForm.js (when editing)
export const updateAdminProduct = async (productId, formData) => {
    console.log(`SERVICE: Updating product ${productId} (placeholder)...`);
    // Log the data that would be sent
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    // Replace with actual API call: const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/products/</span>{productId}`, { method: 'PUT', body: formData, headers: { /* Auth? */ } }); ...
     // Simulate success
    return { success: true, id: productId };
};