const axios = require('axios');

// --- Configuration ---
const API_BASE_URL = "http://localhost:5002";
const NEW_USER = {
  email: `newuser_${Date.now()}@example.com`,
  password: "password123",
  firstName: "Data",
  lastName: "Persistence",
  phone: "555555555",
  idNumber: "987654321"
};
const ATTACKER_USER = {
    email: `attacker_${Date.now()}@example.com`,
    password: "password123",
    firstName: "Attacker",
    lastName: "User",
    phone: "111222333",
    idNumber: "111111111"
};

let authToken = null;
let testUserId = null;

// --- Mock Services ---
const authService = {
  register: async (userData) => {
    try {
        await axios.post(`${API_BASE_URL}/api/auth/signup`, userData);
    } catch (error) {
        // Ignore if user already exists
    }
  },
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      authToken = response.data.token;
      testUserId = response.data.user._id;
      return response.data;
    } catch (error) {
      return null;
    }
  }
};

const productService = {
  getProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      return response.data.products;
    } catch (error) {
      return [];
    }
  }
};

const cartService = {
  addToCart: async (cartItemData) => {
    if (!authToken) return;
    try {
      const config = { headers: { 'Authorization': `Bearer ${authToken}` } };
      return await axios.post(`${API_BASE_URL}/api/carts/add`, cartItemData, config);
    } catch (error) {
      return error.response;
    }
  },
  clearCart: async () => {
    if (!authToken || !testUserId) return;
    try {
      const config = { headers: { 'Authorization': `Bearer ${authToken}` } };
      await axios.delete(`${API_BASE_URL}/api/carts/clear/${testUserId}`, config);
    } catch (error) {
      // Ignore
    }
  }
};

const orderService = {
    createOrder: async (orderData) => {
        if (!authToken) return;
        try {
            const config = { headers: { 'Authorization': `Bearer ${authToken}` } };
            const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
            return response.data;
        } catch (error) {
            return error.response ? error.response.data : { message: error.message };
        }
    },
    getOrderById: async (orderId) => {
        if (!authToken) return;
        try {
            const config = { headers: { 'Authorization': `Bearer ${authToken}` } };
            const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, config);
            return response.data;
        } catch (error) {
            return error.response ? error.response.data : { message: error.message };
        }
    }
};

// --- Test Runner ---
const runTests = async () => {
  console.log("--- Starting Checkout Data Persistence and Security Tests ---");
  
  await authService.register(NEW_USER);
  await authService.register(ATTACKER_USER);

  const products = await productService.getProducts();
  if (!products || products.length === 0) {
    console.error("No products found. Exiting.");
    return;
  }
  
  // Test Cases
  await test_data_persistence(products[0]);
  
  console.log("\n--- All Tests Completed ---");
};

// --- Test Cases ---
const test_data_persistence = async (product) => {
    console.log("\n[Running Test Case: Data Persistence and Security]");

    // 1. Login as the new user and create an order
    await authService.login(NEW_USER.email, NEW_USER.password);
    if (!authToken) return;
    
    await cartService.clearCart();
    const cartItem = {
        product: product._id,
        quantity: 1,
        rentalPeriod: {
            startDate: new Date(Date.now() + 86400000).toISOString(),
            endDate: new Date(Date.now() + 259200000).toISOString()
        }
    };
    await cartService.addToCart(cartItem);

    const mockOrderData = {
        items: [{ ...cartItem, price: product.price }],
        totalValue: product.price,
        customerInfo: NEW_USER,
        contract: {
            signed: true,
            signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
            agreementVersion: "1.0",
            signedAt: new Date().toISOString()
        },
        idUpload: {
            uploaded: true,
            fileName: "test_id.png",
            fileUrl: "https://example.com/test_id.png"
        }
    };
    
    const creationResult = await orderService.createOrder(mockOrderData);
    if (!creationResult || !creationResult.order) {
        console.error("  ❌ FAILED: Could not create order for data persistence test.", creationResult);
        return;
    }
    const orderId = creationResult.order._id;
    console.log(`  Order created for new user with ID: ${orderId}`);

    // 2. Fetch the order and verify its data
    const fetchedOrder = await orderService.getOrderById(orderId);
    if (!fetchedOrder || !fetchedOrder.customerInfo) {
        console.error("  ❌ FAILED: Could not fetch the newly created order.", fetchedOrder);
        return;
    }

    // Verify Customer Info
    if (fetchedOrder.customerInfo.email === NEW_USER.email) console.log("  ✅ PASSED: Customer email is correct.");
    else console.error("  ❌ FAILED: Customer email does not match.");

    // Verify Contract Info
    if (fetchedOrder.contract.signed && fetchedOrder.contract.signatureData) console.log("  ✅ PASSED: Contract data is saved.");
    else console.error("  ❌ FAILED: Contract data not saved correctly.");

    // Verify ID Upload Info
    if (fetchedOrder.idUpload.uploaded && fetchedOrder.idUpload.fileUrl) console.log("  ✅ PASSED: ID upload data is saved.");
    else console.error("  ❌ FAILED: ID upload data not saved correctly.");

    // 3. Security Check: Attacker tries to access the order
    console.log("\n  Security Check: Attacker attempting to access the order...");
    await authService.login(ATTACKER_USER.email, ATTACKER_USER.password);
    if (!authToken) return;

    const accessResult = await orderService.getOrderById(orderId);
    if (accessResult && accessResult.message && accessResult.message.includes("Access denied")) {
        console.log("  ✅ PASSED: Attacker was correctly denied access to the order.");
    } else {
        console.error("  ❌ FAILED: Attacker was able to access the order.", accessResult);
    }
};


// --- Entry Point ---
runTests(); 