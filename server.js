require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const app = express();

// ==================== MIDDLEWARE ====================
// CORS Configuration - Allow all origins for Swagger testing
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("‚úÖ MongoDB Connected"))
  .catch(err => console.error("‚ùå MongoDB Error:", err.message));
} else {
  console.log("‚ö†Ô∏è MONGODB_URI not set, running without database");
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
// Load swagger.json
let swaggerDocument;
try {
  swaggerDocument = require('./swagger.json');
  console.log("‚úÖ Swagger documentation loaded from swagger.json");
} catch (error) {
  console.log("‚ö†Ô∏è Could not load swagger.json, creating basic documentation");
  swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Inventory API",
      version: "1.0.0"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server"
      }
    ],
    paths: {}
  };
}

// Swagger UI configuration
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: '/swagger.json',
        name: 'Inventory API v1.0'
      }
    ],
    validatorUrl: null, // Disable validator to avoid CORS issues
    docExpansion: 'list',
    filter: true,
    displayRequestDuration: true,
    tryItOutEnabled: true,
    displayOperationId: true,
    persistAuthorization: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-size: 36px; color: #333; }
    .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    .swagger-ui .opblock-tag { font-size: 24px; color: #3b4151; }
    .swagger-ui .opblock { border-radius: 8px; }
    .swagger-ui .btn { border-radius: 4px; }
    .try-out__btn { background-color: #4990e2 !important; }
    .execute { background-color: #49cc90 !important; }
    .swagger-ui .scheme-container { background: #fafafa; }
  `,
  customSiteTitle: "Inventory API Documentation",
  customfavIcon: "https://swagger.io/favicon-32x32.png"
};

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Serve raw Swagger JSON
app.get("/swagger.json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(swaggerDocument);
});

console.log("Ì≥ö Swagger documentation available at:");
console.log("   http://localhost:3000/api-docs");
console.log("   http://localhost:3000/swagger.json");

// ==================== API ROUTES ====================
// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Ì≥¶ Inventory Management API v1.0",
    version: "1.0.0",
    description: "REST API for managing inventory items and suppliers",
    documentation: {
      swagger: "/api-docs",
      postman: "https://www.postman.com/collections/YOUR_COLLECTION_ID"
    },
    endpoints: {
      items: {
        getAll: "GET /api/v1/items",
        create: "POST /api/v1/items",
        getOne: "GET /api/v1/items/:id",
        update: "PUT /api/v1/items/:id",
        delete: "DELETE /api/v1/items/:id"
      },
      suppliers: {
        getAll: "GET /api/v1/suppliers",
        create: "POST /api/v1/suppliers",
        getOne: "GET /api/v1/suppliers/:id"
      },
      categories: "GET /api/v1/categories",
      reports: "GET /api/v1/reports/inventory",
      health: "GET /health"
    },
    status: {
      server: "running",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? "healthy" : "degraded",
    service: "Inventory API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime()
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
    console.log("Creating item:", req.body);
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    // Validate required fields
    if (!req.body.name || !req.body.category || !req.body.supplier) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, category, and supplier are required"
      });
    }
    
    const item = new Item({
      name: req.body.name,
      category: req.body.category,
      stock: req.body.stock || 0,
      price: req.body.price || 0,
      supplier: req.body.supplier,
      description: req.body.description || ""
    });
    
    await item.save();
    
    console.log("Item created successfully:", item);
    
    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
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
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });
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
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });
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
    if (!item) return res.status(404).json({ success: false, error: "Item not found" });
    res.json({ success: true, message: "Item deleted successfully" });
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
    
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        error: "Supplier name is required"
      });
    }
    
    const supplier = new Supplier({
      name: req.body.name,
      contact: req.body.contact || "",
      phone: req.body.phone || "",
      email: req.body.email || "",
      address: req.body.address || ""
    });
    
    await supplier.save();
    
    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier
    });
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
    
    // Group by category
    const byCategory = {};
    items.forEach(item => {
      const category = item.category || "Uncategorized";
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, totalStock: 0, totalValue: 0 };
      }
      byCategory[category].count += 1;
      byCategory[category].totalStock += (item.stock || 0);
      byCategory[category].totalValue += ((item.stock || 0) * (item.price || 0));
    });
    
    const categorySummary = Object.keys(byCategory).map(cat => ({
      category: cat,
      itemCount: byCategory[cat].count,
      totalStock: byCategory[cat].totalStock,
      totalValue: byCategory[cat].totalValue
    }));
    
    const lowStock = items.filter(item => (item.stock || 0) <= 5);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalStock,
          totalValue
        },
        byCategory: categorySummary,
        lowStock: lowStock.map(item => ({
          id: item._id,
          name: item.name,
          stock: item.stock,
          category: item.category
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ERROR HANDLING ====================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestions: [
      "Check the endpoint URL",
      "Verify the HTTP method",
      "Visit /api-docs for documentation"
    ]
  });
});

app.use((err, req, res, next) => {
  console.error("Ì¥• Server Error:", err.stack);
  
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    error: "Server Error",
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Ì∫Ä Server is running on port ${PORT}`);
  console.log(`Ìºê Local: http://localhost:${PORT}`);
  console.log(`Ì≥ö Docs: http://localhost:${PORT}/api-docs`);
  console.log(`Ì≥ã Health: http://localhost:${PORT}/health`);
  console.log(`Ì¥ß API: http://localhost:${PORT}/api/v1/items`);
});

module.exports = app;
