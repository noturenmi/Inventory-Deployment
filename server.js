require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const v1Routes = require("./api/v1/routes");

const app = express();

// ================ MIDDLEWARE ================
app.use(helmet());

// Configure CORS properly
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (exclude Swagger UI)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path.includes('/api-docs'), // Skip rate limiting for Swagger
  message: {
    success: false,
    error: "Too many requests"
  }
});
app.use("/api/", limiter);

// ================ DATABASE CONNECTION ================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/inventory_db";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// ================ SWAGGER DOCUMENTATION ================
// First, try to load Swagger document
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.join(__dirname, "api/v1/docs/swagger.yaml"));
  
  // IMPORTANT: Fix the server URL for Swagger
  swaggerDocument.servers = [
    {
      url: "http://localhost:3000/api/v1",
      description: "Local Development Server"
    }
  ];
  
  console.log("✅ Swagger YAML loaded successfully");
} catch (err) {
  console.warn("⚠️ Could not load Swagger YAML:", err.message);
  // Create a basic Swagger document if YAML fails
  swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Inventory API",
      version: "1.0.0",
      description: "Inventory Management API"
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local server"
      }
    ],
    paths: {}
  };
}

// Configure Swagger UI options
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: '/swagger.json',
        name: 'Inventory API v1'
      }
    ],
    validatorUrl: null, // Disable validator
    docExpansion: 'list',
    filter: true,
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .try-out { display: block !important }
    .btn.try-out__btn { display: inline-block !important }
  `,
  customSiteTitle: "Inventory API Documentation"
};

// Serve Swagger UI at multiple endpoints
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Also serve raw Swagger JSON
app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

console.log("📚 Swagger UI available at:");
console.log("   http://localhost:3000/api/v1/api-docs");
console.log("   http://localhost:3000/api-docs");
console.log("   http://localhost:3000/swagger.json");

// ================ ROUTES ================
app.use("/api/v1", v1Routes);

// ================ ROOT ENDPOINTS ================
app.get("/", (req, res) => {
  res.json({
    message: "📦 Inventory API",
    version: "1.0.0",
    docs: [
      "http://localhost:3000/api/v1/api-docs",
      "http://localhost:3000/api-docs"
    ],
    endpoints: {
      items: "/api/v1/items",
      suppliers: "/api/v1/suppliers",
      health: "/health"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// ================ ERROR HANDLING ================
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ================ SERVER START ================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
EOF