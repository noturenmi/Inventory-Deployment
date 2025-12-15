const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection - VERCEL OPTIMIZED
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

// Initialize mongoose connection (will connect on first request)
if (mongoUri) {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("✅ MongoDB Connected");
  }).catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
  });
} else {
  console.warn("⚠️  MongoDB URI not found. API will work but without database.");
}

// Import models
require("./models/Item");
require("./models/Category");
require("./models/Supplier");

// Import routes
const itemsRouter = require("./routes/items");
const categoriesRouter = require("./routes/categories");
const suppliersRouter = require("./routes/suppliers");

// Routes
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/suppliers", suppliersRouter);

// Health check endpoint (IMPORTANT for Vercel)
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || "development"
  });
});

// Try to load Swagger (optional, won't crash if missing)
try {
  const swaggerUi = require("swagger-ui-express");
  const swaggerDocument = require("./swagger/swagger.json");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get("/swagger.json", (req, res) => {
    res.sendFile(path.join(__dirname, "swagger", "swagger.json"));
  });
  console.log("✅ Swagger UI enabled");
} catch (error) {
  console.log("⚠️  Swagger UI disabled:", error.message);
}

// Simple homepage
app.get("/", (req, res) => {
  res.json({
    message: "Inventory API is running!",
    endpoints: {
      items: "/api/v1/items",
      categories: "/api/v1/categories",
      suppliers: "/api/v1/suppliers",
      documentation: "/api-docs",
      health: "/api/health"
    },
    deployment: "Vercel",
    status: "active"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : {}
  });
});

// For Vercel: Export the app as serverless function
module.exports = app;