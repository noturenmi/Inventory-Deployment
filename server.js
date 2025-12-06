// ==================== IMPORTS ====================
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

// Create Express app
const app = express();

// ==================== MIDDLEWARE ====================
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: {
    success: false,
    error: "Too many requests, please try again later."
  }
});
app.use(limiter);

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("âœ… MongoDB Connected"))
  .catch(err => console.error("âŒ MongoDB Error:", err.message));
} else {
  console.log("âš ï¸ MONGODB_URI not set in .env");
}

// ==================== SIMPLE SCHEMAS ====================
const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  stock: Number,
  price: Number,
  supplier: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const supplierSchema = new mongoose.Schema({
  name: String,
  contact: String,
  phone: String,
  email: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model("Item", itemSchema);
const Supplier = mongoose.model("Supplier", supplierSchema);

// ==================== SWAGGER DOCUMENTATION ====================
// Try to load swagger.json
let swaggerDocument;
try {
  swaggerDocument = require('./swagger.json');
  console.log("âœ… Swagger documentation loaded");
} catch (error) {
  console.log("âš ï¸ Could not load swagger.json, using basic docs");
  swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Inventory API",
      version: "1.0.0",
      description: "Inventory Management API"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server"
      },
      {
        url: "https://zentinels-inventory-deployment.vercel.app",
        description: "Production server"
      }
    ],
    paths: {
      "/": {
        get: {
          summary: "API Root",
          responses: {
            "200": {
              description: "API information"
            }
          }
        }
      }
    }
  };
}

// Swagger UI options
const swaggerOptions = {
  explorer: true,
  customSiteTitle: "Inventory API Documentation"
};

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Serve raw Swagger JSON
app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

console.log("í³š Swagger docs available at /api-docs");

// ==================== API ROUTES ====================
// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "í³¦ Inventory API v1.0",
    documentation: "/api-docs",
    endpoints: {
      items: "/api/v1/items",
      suppliers: "/api/v1/suppliers",
      categories: "/api/v1/categories",
      reports: "/api/v1/reports/inventory",
      health: "/health"
    },
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// ITEMS ENDPOINTS
app.get("/api/v1/items", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: "Database not connected - using mock data"
      });
    }
    const items = await Item.find();
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/v1/items", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    const item = new Item(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/api/v1/items/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/v1/items/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete("/api/v1/items/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SUPPLIERS ENDPOINTS
app.get("/api/v1/suppliers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: "Database not connected"
      });
    }
    const suppliers = await Supplier.find();
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/v1/suppliers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ADDITIONAL ENDPOINTS
app.get("/api/v1/categories", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: ["Electronics", "Clothing", "Food", "Books", "General", "Office Supplies"],
        mock: true
      });
    }
    const categories = await Item.distinct("category");
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/v1/reports/inventory", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          summary: { totalItems: 0, totalStock: 0, totalValue: 0 },
          byCategory: [],
          lowStock: [],
          mock: true
        }
      });
    }
    const items = await Item.find();
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);
    
    res.json({
      success: true,
      data: {
        summary: { totalItems, totalStock, totalValue },
        lowStock: items.filter(item => (item.stock || 0) <= 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.url} not found`,
    documentation: "/api-docs"
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`íº€ Server running on http://localhost:${PORT}`);
  console.log(`í³š Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
