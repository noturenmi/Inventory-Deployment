require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// ==================== CORS CONFIGURATION ====================
// This is the MOST IMPORTANT PART - Fix CORS for Swagger UI
const corsOptions = {
  origin: '*', // Allow ALL origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ==================== OTHER MIDDLEWARE ====================
app.use(helmet());
app.use(express.json());

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
  console.log("âš ï¸ MONGODB_URI not set, running without database");
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
        message: "Database not connected"
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

// ==================== SWAGGER DOCUMENTATION ====================
// Serve Swagger UI from CDN (NO CORS issues this way)
app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Inventory API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui.css">
        <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin: 0; background: #fafafa; }
            .swagger-ui .topbar { display: none; }
            .swagger-ui .info { margin: 20px 0; }
            .swagger-ui .info .title { font-size: 36px; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
        <script>
        window.onload = function() {
            // Get current host
            const host = window.location.origin;
            
            // Swagger specification
            const spec = {
                "openapi": "3.0.0",
                "info": {
                    "title": "Inventory Management API",
                    "version": "1.0.0",
                    "description": "í³¦ Complete REST API for managing inventory items and suppliers"
                },
                "servers": [
                    {
                        "url": host,
                        "description": "Current Server"
                    },
                    {
                        "url": "https://zentinels-inventory-deployment.vercel.app",
                        "description": "Production Server"
                    },
                    {
                        "url": "http://localhost:3000",
                        "description": "Local Development"
                    }
                ],
                "tags": [
                    {
                        "name": "Items",
                        "description": "Operations related to inventory items"
                    },
                    {
                        "name": "Suppliers",
                        "description": "Operations related to suppliers"
                    }
                ],
                "paths": {
                    "/": {
                        "get": {
                            "summary": "API Root",
                            "responses": {
                                "200": {
                                    "description": "API information"
                                }
                            }
                        }
                    },
                    "/health": {
                        "get": {
                            "summary": "Health Check",
                            "responses": {
                                "200": {
                                    "description": "API health status"
                                }
                            }
                        }
                    },
                    "/api/v1/items": {
                        "get": {
                            "tags": ["Items"],
                            "summary": "Get all items",
                            "responses": {
                                "200": {
                                    "description": "List of items",
                                    "content": {
                                        "application/json": {
                                            "example": {
                                                "success": true,
                                                "count": 2,
                                                "data": [
                                                    {
                                                        "_id": "64f8a1b2c9d3e7f5a2b1c3d4",
                                                        "name": "Laptop",
                                                        "category": "Electronics",
                                                        "stock": 10,
                                                        "price": 999.99,
                                                        "supplier": "supplier_id",
                                                        "createdAt": "2024-01-15T10:30:00Z"
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "post": {
                            "tags": ["Items"],
                            "summary": "Create new item",
                            "requestBody": {
                                "required": true,
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "required": ["name", "category", "stock", "price", "supplier"],
                                            "properties": {
                                                "name": { "type": "string", "example": "Laptop" },
                                                "category": { "type": "string", "example": "Electronics" },
                                                "stock": { "type": "integer", "example": 10 },
                                                "price": { "type": "number", "example": 999.99 },
                                                "supplier": { "type": "string", "example": "supplier_id" },
                                                "description": { "type": "string", "example": "High-performance laptop" }
                                            }
                                        },
                                        "example": {
                                            "name": "Laptop",
                                            "category": "Electronics",
                                            "stock": 10,
                                            "price": 999.99,
                                            "supplier": "supplier_id",
                                            "description": "High-performance laptop"
                                        }
                                    }
                                }
                            },
                            "responses": {
                                "201": {
                                    "description": "Item created",
                                    "content": {
                                        "application/json": {
                                            "example": {
                                                "success": true,
                                                "data": {
                                                    "_id": "64f8a1b2c9d3e7f5a2b1c3d4",
                                                    "name": "Laptop",
                                                    "category": "Electronics",
                                                    "stock": 10,
                                                    "price": 999.99,
                                                    "supplier": "supplier_id",
                                                    "description": "High-performance laptop",
                                                    "createdAt": "2024-01-15T10:30:00Z"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "/api/v1/suppliers": {
                        "get": {
                            "tags": ["Suppliers"],
                            "summary": "Get all suppliers",
                            "responses": {
                                "200": {
                                    "description": "List of suppliers"
                                }
                            }
                        },
                        "post": {
                            "tags": ["Suppliers"],
                            "summary": "Create supplier",
                            "requestBody": {
                                "content": {
                                    "application/json": {
                                        "example": {
                                            "name": "Tech Supplies Inc.",
                                            "contact": "John Doe",
                                            "email": "contact@tech.com"
                                        }
                                    }
                                }
                            },
                            "responses": {
                                "201": {
                                    "description": "Supplier created"
                                }
                            }
                        }
                    }
                }
            };
            
            // Initialize Swagger UI
            const ui = SwaggerUIBundle({
                spec: spec,
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout",
                validatorUrl: null, // Disable validator
                displayRequestDuration: true,
                docExpansion: 'list'
            });
            
            window.ui = ui;
        };
        </script>
    </body>
    </html>
  `);
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
  console.log(`í´§ CORS enabled for all origins`);
});

module.exports = app;
