require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());
app.options('*', cors());

// ==================== SIMPLE SWAGGER ====================
// Simple Swagger UI (no file needed)
app.get("/api-docs", (req, res) => {
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
          url: "/swagger.json", // or your swagger.json path
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout"
        });
      </script>
    </body>
    </html>
  `);
});

// If you have a swagger.json file
app.get("/swagger.json", (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: {
      title: "Inventory API",
      version: "1.0.0",
      description: "API for inventory management"
    },
    servers: [{ url: "http://localhost:3000" }],
    paths: {
      "/api/v1/items": {
        get: { summary: "Get all items" },
        post: { summary: "Create item" }
      },
      "/api/v1/suppliers": {
        get: { summary: "Get all suppliers" },
        post: { summary: "Create supplier" }
      }
    }
  });
});

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));
}

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

app.get("/docs", (req, res) => {
  res.redirect("/api-docs");
});

console.log("📚 Swagger docs available at /api-docs");

// ==================== API ROUTES ====================
// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "📦 Inventory API v1.0",
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

// ✅ IMPORTANT: Use your route files instead of defining routes here
const apiRoutes = require("./api/v1/routes/index");
app.use("/api/v1", apiRoutes);

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📚 Also at: http://localhost:${PORT}/docs`);
});

module.exports = app;