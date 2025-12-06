require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// ================ MIDDLEWARE ================
app.use(helmet());
app.use(cors());
app.use(express.json());

// ================ DATABASE CONNECTION ================
const MONGODB_URI = process.env.MONGODB_URI;

// Connection with retry logic for Vercel
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 3;

async function connectToDatabase() {
  if (isConnected) {
    console.log("‚úÖ Using existing database connection");
    return;
  }

  try {
    console.log("Ì¥Ñ Attempting MongoDB connection...");
    
    // For Vercel serverless, we need specific options
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      console.log("‚úÖ MongoDB Connected Successfully on Vercel");
      console.log(`Ì≥ä Database: ${mongoose.connection.name}`);
    }
  } catch (error) {
    console.error("‚ùå MongoDB Connection Error:", error.message);
    
    // Retry logic for Vercel cold starts
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Ì¥Ñ Retrying connection (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectToDatabase, 1000);
    } else {
      console.error("‚ùå Max retries reached. Starting without DB connection.");
    }
  }
}

// Connect to database on startup
connectToDatabase();

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('‚úÖ Mongoose connected to DB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('‚ùå Mongoose connection error:', err.message);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('‚ö†Ô∏è Mongoose disconnected from DB');
  isConnected = false;
});

// Graceful shutdown for Vercel
process.on('SIGTERM', async () => {
  console.log('‚ö†Ô∏è SIGTERM received. Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('‚úÖ MongoDB connection closed.');
  process.exit(0);
});

// ================ SIMPLE ROUTES (No complex imports) ================
// Define schemas directly to avoid import issues
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  stock: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  supplier: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: String,
  phone: String,
  email: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);

// ================ BASIC API ROUTES ================
app.get("/", (req, res) => {
  res.json({
    message: "Ì≥¶ Inventory API is running on Vercel!",
    version: "1.0.0",
    status: "operational",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    endpoints: {
      items: "/api/v1/items",
      suppliers: "/api/v1/suppliers",
      health: "/health",
      docs: "/api-docs"
    }
  });
});

app.get("/health", async (req, res) => {
  try {
    const dbStatus = isConnected ? "connected" : "disconnected";
    const statusCode = isConnected ? 200 : 503;
    
    res.status(statusCode).json({
      status: dbStatus === "connected" ? "healthy" : "degraded",
      service: "Inventory API",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

// ITEMS ROUTES
app.get("/api/v1/items", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const items = await Item.find();
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

app.post("/api/v1/items", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const item = new Item(req.body);
    await item.save();
    
    res.status(201).json({
      success: true,
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
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

app.put("/api/v1/items/:id", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.delete("/api/v1/items/:id", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }
    
    res.json({
      success: true,
      message: "Item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// SUPPLIERS ROUTES
app.get("/api/v1/suppliers", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const suppliers = await Supplier.find();
    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

app.post("/api/v1/suppliers", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const supplier = new Supplier(req.body);
    await supplier.save();
    
    res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ADDITIONAL ENDPOINTS
app.get("/api/v1/categories", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const categories = await Item.distinct("category");
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

app.get("/api/v1/reports/inventory", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database not connected"
      });
    }
    
    const items = await Item.find();
    
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);
    
    const lowStock = items.filter(item => (item.stock || 0) <= 5);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalStock,
          totalValue
        },
        lowStock: lowStock.map(item => ({
          id: item._id,
          name: item.name,
          stock: item.stock
        }))
      }
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// SIMPLE SWAGGER DOCS PAGE
app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inventory API Documentation</title>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css">
      <style>
        body { margin: 0; padding: 0; }
        #swagger-ui { padding: 20px; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
      <script>
        const spec = {
          openapi: "3.0.0",
          info: {
            title: "Inventory API",
            version: "1.0.0",
            description: "API for Inventory Management"
          },
          servers: [
            { url: "https://zentinels-inventory-deployment.vercel.app", description: "Production" }
          ],
          paths: {
            "/api/v1/items": {
              get: { summary: "Get all items", responses: { "200": { description: "Success" } } },
              post: { 
                summary: "Create item",
                requestBody: {
                  content: {
                    "application/json": {
                      example: {
                        name: "Laptop",
                        category: "Electronics",
                        stock: 10,
                        price: 999.99,
                        supplier: "supplier_id"
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ]
        });
      </script>
    </body>
    </html>
  `);
});

// ================ ERROR HANDLING ================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ================ EXPORT FOR VERCEL ================
module.exports = app;
