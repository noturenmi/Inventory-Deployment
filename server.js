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

// Try to load Swagger (with better error handling)
let swaggerSetup = null;
try {
  const swaggerUi = require("swagger-ui-express");
  const swaggerPath = path.join(__dirname, "swagger", "swagger.json");
  
  // Check if file exists
  if (require("fs").existsSync(swaggerPath)) {
    const swaggerDocument = require(swaggerPath);
    swaggerSetup = swaggerUi.setup(swaggerDocument);
    
    app.use("/api-docs", swaggerUi.serve, (req, res, next) => {
      if (!swaggerSetup) return next();
      return swaggerUi.setup(swaggerDocument)(req, res, next);
    });
    
    app.get("/swagger.json", (req, res) => {
      res.sendFile(swaggerPath);
    });
    
    console.log("✅ Swagger UI enabled");
  } else {
    console.warn("⚠️  swagger.json file not found");
  }
} catch (error) {
  console.log("⚠️  Swagger UI disabled:", error.message);
}

// Simple homepage
app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Inventory API Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f6f9; margin:0; padding:0; }
                header { background: #2d89ef; color: white; padding: 20px; text-align:center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);}
                h1 { margin:0; font-size:28px; }
                .container { max-width: 900px; margin:40px auto; padding:20px; }
                .card { background:white; padding:20px; margin-bottom:20px; border-radius:10px; box-shadow:0 3px 8px rgba(0,0,0,0.1);}
                .card h2 { color: #2d89ef; margin-top:0;}
                ul { list-style:none; padding:0;}
                li { padding:8px 0;}
                a { color:#2d89ef; font-weight:600; text-decoration:none;}
                a:hover { text-decoration:underline;}
                footer { text-align:center; padding:20px; margin-top:40px; color:#777;}
            </style>
        </head>
        <body>
            <header>
                <h1>📦 Inventory System API Dashboard</h1>
                <p>View and test available API endpoints</p>
            </header>

            <div class="container">
                <div class="card">
                    <h2>📁 Items</h2>
                    <ul>
                        <li><a href="/api/v1/items">GET /api/v1/items</a></li>
                        <li>POST /api/v1/items</li>
                        <li>GET /api/v1/items/:id</li>
                        <li>PUT /api/v1/items/:id</li>
                        <li>DELETE /api/v1/items/:id</li>
                    </ul>
                </div>

                <div class="card">
                    <h2>📚 Categories</h2>
                    <ul>
                        <li><a href="/api/v1/categories">GET /api/v1/categories</a></li>
                        <li>POST /api/v1/categories</li>
                        <li>GET /api/v1/categories/:id</li>
                        <li>PUT /api/v1/categories/:id</li>
                        <li>DELETE /api/v1/categories/:id</li>
                    </ul>
                </div>

                <div class="card">
                    <h2>🏭 Suppliers</h2>
                    <ul>
                        <li><a href="/api/v1/suppliers">GET /api/v1/suppliers</a></li>
                        <li>POST /api/v1/suppliers</li>
                        <li>GET /api/v1/suppliers/:id</li>
                        <li>PUT /api/v1/suppliers/:id</li>
                        <li>DELETE /api/v1/suppliers/:id</li>
                    </ul>
                </div>
                <div class="card">
                    <h2>📘 API Documentation</h2>
                    <ul>
                        <li><a href="/api-docs">Open Swagger UI</a></li>
                        <li><a href="/swagger.json">View Swagger JSON</a></li>
                    </ul>
                </div>
            </div>

            <footer>
                Inventory API © ${new Date().getFullYear()}
            </footer>
        </body>
        </html>
    `);
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