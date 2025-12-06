require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const app = express();

// ==================== MIDDLEWARE ====================
// Allow ALL origins for Swagger UI to work
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());

// Handle preflight requests
app.options('*', cors());

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("‚úÖ MongoDB Connected"))
  .catch(err => console.error("‚ùå MongoDB Error:", err.message));
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
// Serve the HTML file directly
app.get("/api-docs", (req, res) => {
  try {
    const html = fs.readFileSync(path.join(__dirname, 'swagger.html'), 'utf8');
    res.send(html);
  } catch (error) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventory API Docs</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            spec: {openapi:"3.0.0",info:{title:"Inventory API",version:"1.0.0"},servers:[{url:"http://localhost:3000"}]},
            dom_id: '#swagger-ui'
          });
        </script>
      </body>
      </html>
    `);
  }
});

// Also serve at root
app.get("/docs", (req, res) => {
  res.redirect("/api-docs");
});

console.log("Ì≥ö Swagger docs available at /api-docs");

// ==================== API ROUTES ====================
// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Ì≥¶ Inventory API v1.0",
    documentation: "/api-docs",
    endpoints: {
      items: "/api/v1/items",
      suppliers: "/api/v1/suppliers",
      categories: "/api/v1/categories",
      reports: "/api/v1/reports/inventory",
      health: "/health"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString()
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
  console.log(`Ì∫Ä Server running on http://localhost:${PORT}`);
  console.log(`Ì≥ö Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Ìºê Also at: http://localhost:${PORT}/docs`);
});

module.exports = app;
