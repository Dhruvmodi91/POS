require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const menuRoutes = require("./src/routes/menuRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const kitchenRoutes = require("./src/routes/kitchenRoutes");
const waiterRoutes = require("./src/routes/waiterRoutes");
const counterRoutes = require("./src/routes/counterRoutes");
const tableRoutes = require("./src/routes/tableRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const connectDB = require("./src/Config/db");

connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/counter", counterRoutes);
app.use("/api/waiter", waiterRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "POS System API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
});
