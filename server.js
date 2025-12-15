const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

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

// ========== SWAGGER FIX ==========
// Create swagger.json directly in code (no file needed!)
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Inventory Management API",
    description: "API for managing inventory items, categories, and suppliers",
    version: "1.0.0",
    contact: {
      name: "API Support",
      email: "support@example.com"
    }
  },
  servers: [
    {
      url: "https://zentinels-inventory-deployment.vercel.app",
      description: "Production server"
    },
    {
      url: "http://localhost:3000",
      description: "Development server"
    }
  ],
  tags: [
    { name: "Items", description: "Item management endpoints" },
    { name: "Categories", description: "Category management endpoints" },
    { name: "Suppliers", description: "Supplier management endpoints" }
  ],
  paths: {
    // ITEMS
    "/api/v1/items": {
      get: {
        tags: ["Items"],
        summary: "Get all items",
        responses: {
          "200": {
            description: "List of all items",
            content: {
              "application/json": {
                example: [
                  {
                    "_id": "507f1f77bcf86cd799439011",
                    "name": "Laptop",
                    "category": "Electronics",
                    "supplier": "Tech Corp",
                    "stock": 10,
                    "price": 999.99
                  }
                ]
              }
            }
          }
        }
      },
      post: {
        tags: ["Items"],
        summary: "Create a new item",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Laptop" },
                  description: { type: "string", example: "Gaming laptop" },
                  category: { type: "string", example: "Electronics" },
                  supplier: { type: "string", example: "Tech Corp" },
                  stock: { type: "number", example: 10 },
                  price: { type: "number", example: 999.99 }
                },
                required: ["name", "category", "supplier", "stock"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Item created successfully"
          }
        }
      }
    },
    "/api/v1/items/{id}": {
      get: {
        tags: ["Items"],
        summary: "Get item by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Item ID"
          }
        ],
        responses: {
          "200": { description: "Item details" },
          "404": { description: "Item not found" }
        }
      },
      put: {
        tags: ["Items"],
        summary: "Update item",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  stock: { type: "number" },
                  price: { type: "number" }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Items"],
        summary: "Delete item",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ]
      }
    },
    
    // CATEGORIES
    "/api/v1/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all categories",
        responses: {
          "200": { description: "List of categories" }
        }
      },
      post: {
        tags: ["Categories"],
        summary: "Create new category",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Electronics" },
                  description: { type: "string", example: "Electronic devices" }
                },
                required: ["name"]
              }
            }
          }
        }
      }
    },
    
    // SUPPLIERS
    "/api/v1/suppliers": {
      get: {
        tags: ["Suppliers"],
        summary: "Get all suppliers",
        responses: {
          "200": { description: "List of suppliers" }
        }
      },
      post: {
        tags: ["Suppliers"],
        summary: "Create new supplier",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Tech Corp" },
                  contactPerson: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "contact@techcorp.com" },
                  phone: { type: "string", example: "+1234567890" }
                },
                required: ["name", "phone"]
              }
            }
          }
        }
      }
    },
    
    // HEALTH CHECK
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API health status",
            content: {
              "application/json": {
                example: {
                  status: "OK",
                  timestamp: "2023-10-01T12:00:00.000Z",
                  database: "connected"
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Item: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          supplier: { type: "string" },
          stock: { type: "number" },
          price: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      }
    }
  }
};

// Setup Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Also serve swagger.json directly
app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Inventory API",
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    documentation: "/api-docs"
  });
});

// Simple homepage
app.get("/", (req, res) => {
  res.json({
    message: "📦 Inventory Management API",
    version: "1.0.0",
    endpoints: {
      items: "/api/v1/items",
      categories: "/api/v1/categories",
      suppliers: "/api/v1/suppliers",
      documentation: "/api-docs",
      health: "/api/health"
    }
  });
});

// Export for Vercel
module.exports = app;