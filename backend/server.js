const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Use routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/carts", cartRoutes);

// Default route for testing
app.get("/", (req, res) => {
  res.send("✅ Shula API is running...");
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
