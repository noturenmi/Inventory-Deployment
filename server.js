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

// Configure Helmet for Swagger UI compatibility
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"]
    }
  }
}));

app.use(express.json());
app.options('*', cors());

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

// ==================== SIMPLE SWAGGER UI ====================
// Simple inline Swagger UI (no external file needed)
app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Inventory API Documentation</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui.css">
      <style>
        html { box-sizing: border-box; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          // Use a default OpenAPI spec
          const spec = {
            openapi: "3.0.0",
            info: {
              title: "Inventory Management API",
              version: "1.0.0",
              description: "API for managing inventory items and suppliers"
            },
            servers: [
              {
                url: "http://localhost:${process.env.PORT || 3000}",
                description: "Development server"
              }
            ],
            paths: {
              "/api/v1/items": {
                get: {
                  summary: "Get all items",
                  responses: {
                    "200": { description: "List of items" }
                  }
                },
                post: {
                  summary: "Create new item",
                  responses: {
                    "201": { description: "Item created" }
                  }
                }
              },
              "/api/v1/items/{id}": {
                get: {
                  summary: "Get item by ID",
                  parameters: [{
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                  }],
                  responses: {
                    "200": { description: "Item details" }
                  }
                }
              },
              "/api/v1/suppliers": {
                get: {
                  summary: "Get all suppliers",
                  responses: {
                    "200": { description: "List of suppliers" }
                  }
                },
                post: {
                  summary: "Create new supplier",
                  responses: {
                    "201": { description: "Supplier created" }
                  }
                }
              }
            }
          };
          
          // Initialize Swagger UI
          window.ui = SwaggerUIBundle({
            spec: spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
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

// Use your route files
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