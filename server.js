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

// MongoDB connection
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("✅ MongoDB Connected");
  }).catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
  });
}

// Import models
require("./models/Item");
require("./models/Category");
require("./models/Supplier");

// Routes
app.use("/api/v1/items", require("./routes/items"));
app.use("/api/v1/categories", require("./routes/categories"));
app.use("/api/v1/suppliers", require("./routes/suppliers"));

// ========== FIXED SWAGGER SECTION ==========
// Simple HTML API documentation (no swagger.json file needed!)
app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>📚 Inventory API Documentation</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        header {
          background: #2d3748;
          color: white;
          padding: 30px;
          text-align: center;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        .subtitle {
          color: #cbd5e0;
          font-size: 1.1rem;
        }
        .content {
          padding: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
        }
        .endpoint-card {
          background: #f7fafc;
          border-radius: 10px;
          padding: 25px;
          border-left: 5px solid #4299e1;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .endpoint-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .method {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 0.9rem;
          margin-right: 10px;
        }
        .method.get { background: #c6f6d5; color: #22543d; }
        .method.post { background: #bee3f8; color: #2a4365; }
        .method.put { background: #fed7d7; color: #742a2a; }
        .method.delete { background: #e9d8fd; color: #44337a; }
        .endpoint-path {
          font-family: monospace;
          background: #edf2f7;
          padding: 8px 15px;
          border-radius: 5px;
          margin: 15px 0;
          display: block;
          font-size: 1.1rem;
        }
        .test-btn {
          background: #4299e1;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 15px;
          display: inline-block;
          text-decoration: none;
          transition: background 0.3s;
        }
        .test-btn:hover {
          background: #3182ce;
        }
        footer {
          text-align: center;
          padding: 20px;
          color: #718096;
          border-top: 1px solid #e2e8f0;
        }
        .quick-test {
          background: #e6fffa;
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
          border: 2px dashed #38b2ac;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>📦 Inventory API Documentation</h1>
          <p class="subtitle">Complete API reference for inventory management system</p>
        </header>
        
        <div class="content">
          <!-- Items Endpoints -->
          <div class="endpoint-card">
            <h2>📁 Items Management</h2>
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-path">/api/v1/items</span>
              <p>Get all inventory items</p>
              <a href="/api/v1/items" class="test-btn" target="_blank">Test Endpoint</a>
            </div>
            
            <div style="margin-top: 20px;">
              <span class="method post">POST</span>
              <span class="endpoint-path">/api/v1/items</span>
              <p>Create new item</p>
            </div>
          </div>
          
          <!-- Categories Endpoints -->
          <div class="endpoint-card">
            <h2>📚 Categories Management</h2>
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-path">/api/v1/categories</span>
              <p>Get all categories</p>
              <a href="/api/v1/categories" class="test-btn" target="_blank">Test Endpoint</a>
            </div>
            
            <div style="margin-top: 20px;">
              <span class="method post">POST</span>
              <span class="endpoint-path">/api/v1/categories</span>
              <p>Create new category</p>
            </div>
          </div>
          
          <!-- Suppliers Endpoints -->
          <div class="endpoint-card">
            <h2>🏭 Suppliers Management</h2>
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-path">/api/v1/suppliers</span>
              <p>Get all suppliers</p>
              <a href="/api/v1/suppliers" class="test-btn" target="_blank">Test Endpoint</a>
            </div>
            
            <div style="margin-top: 20px;">
              <span class="method post">POST</span>
              <span class="endpoint-path">/api/v1/suppliers</span>
              <p>Create new supplier</p>
            </div>
          </div>
          
          <!-- Health & Status -->
          <div class="endpoint-card">
            <h2>📊 System Status</h2>
            <div>
              <span class="method get">GET</span>
              <span class="endpoint-path">/api/health</span>
              <p>Check API health and database status</p>
              <a href="/api/health" class="test-btn" target="_blank">Test Health</a>
            </div>
            
            <div style="margin-top: 20px;">
              <span class="method get">GET</span>
              <span class="endpoint-path">/</span>
              <p>API homepage</p>
              <a href="/" class="test-btn" target="_blank">Visit Home</a>
            </div>
          </div>
        </div>
        
        <!-- Quick Test Section -->
        <div class="quick-test">
          <h3>🚀 Quick API Test</h3>
          <p>Test POST request to create an item:</p>
          <pre style="background: #2d3748; color: white; padding: 15px; border-radius: 5px; margin: 15px 0; overflow-x: auto;">
// Example JSON for POST /api/v1/items
{
  "name": "Laptop",
  "description": "Gaming laptop",
  "category": "electronics",
  "supplier": "tech-supply",
  "stock": 10,
  "price": 999.99
}</pre>
          <p>Use Postman or curl to test the API endpoints!</p>
        </div>
        
        <footer>
          <p>Inventory API • Built with Express & MongoDB • Deployed on Vercel</p>
          <p>📍 Base URL: https://zentinels-inventory-deployment.vercel.app</p>
        </footer>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Inventory API",
    version: "1.0.0",
    database: mongoUri ? "Configured" : "Not configured",
    mongodb_status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

// Simple homepage
app.get("/", (req, res) => {
  res.json({
    message: "📦 Inventory Management API",
    version: "1.0.0",
    status: "active",
    documentation: "/api-docs",
    endpoints: {
      items: "/api/v1/items",
      categories: "/api/v1/categories",
      suppliers: "/api/v1/suppliers",
      health: "/api/health"
    },
    try_it: "Visit /api-docs for interactive documentation"
  });
});

// Export for Vercel
module.exports = app;