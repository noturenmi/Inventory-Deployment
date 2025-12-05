// ==============================
// Inventory API v1.0
// Node.js + Express + MongoDB + Swagger
// Deployable to Vercel
// ==============================

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Import routes
const v1Routes = require("./api/v1/routes");

// Create Express app
const app = express();

// ==============================
// Security Middleware
// ==============================
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==============================
// MongoDB Connection
// ==============================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/inventory_db";
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = mongoose.connection.readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
}

// Connection events
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB Disconnected");
  isConnected = false;
});

// ==============================
// Swagger Documentation
// ==============================
const swaggerDocument = YAML.load("./api/v1/docs/swagger.yaml");
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Additional route

// ==============================
// API Routes
// ==============================
app.use("/api/v1", v1Routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "📦 Inventory Management API",
    version: "1.0.0",
    documentation: "/api/v1/api-docs",
    endpoints: {
      items: "/api/v1/items",
      suppliers: "/api/v1/suppliers",
      categories: "/api/v1/categories",
      reports: "/api/v1/reports/inventory"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: isConnected ? "Connected" : "Disconnected"
  });
});

// ==============================
// Error Handling Middleware
// ==============================
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    error: "Server Error",
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==============================
// Server Configuration
// ==============================
const PORT = process.env.PORT || 3000;

// Start server only if not in Vercel
if (require.main === module) {
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/api-docs`);
    });
  }).catch(console.error);
}

// Export for Vercel serverless
module.exports = app;