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
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
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

// ==================== COMPLETE SWAGGER DOCUMENTATION ====================
app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Inventory Management API Documentation</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui.css">
      <style>
        html { box-sizing: border-box; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const spec = {
            openapi: "3.0.0",
            info: {
              title: "📦 Inventory Management API",
              version: "1.0.0",
              description: "Complete API for managing inventory items, suppliers, and categories",
            },
            servers: [
              {
                url: "http://localhost:${process.env.PORT || 3000}",
                description: "Development server"
              }
            ],
            tags: [
              { name: "Items", description: "Item management operations" },
              { name: "Suppliers", description: "Supplier management operations" },
              { name: "Categories", description: "Category operations" },
              { name: "Reports", description: "Inventory reports" },
              { name: "Health", description: "Server health check" }
            ],
            paths: {
              // ==================== ITEMS ENDPOINTS ====================
              "/api/v1/items": {
                get: {
                  tags: ["Items"],
                  summary: "Get all items",
                  description: "Retrieve a list of all inventory items",
                  responses: {
                    "200": {
                      description: "Successful operation",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              count: { type: "integer" },
                              data: {
                                type: "array",
                                items: { $ref: "#/components/schemas/Item" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                post: {
                  tags: ["Items"],
                  summary: "Create a new item",
                  description: "Add a new item to inventory",
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/ItemInput" }
                      }
                    }
                  },
                  responses: {
                    "201": {
                      description: "Item created successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: { $ref: "#/components/schemas/Item" }
                            }
                          }
                        }
                      }
                    },
                    "400": { description: "Invalid input" }
                  }
                }
              },
              
              "/api/v1/items/{id}": {
                get: {
                  tags: ["Items"],
                  summary: "Get item by ID",
                  description: "Retrieve a single item by its ID",
                  parameters: [
                    {
                      name: "id",
                      in: "path",
                      required: true,
                      description: "Item ID",
                      schema: { type: "string" }
                    }
                  ],
                  responses: {
                    "200": {
                      description: "Successful operation",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: { $ref: "#/components/schemas/Item" }
                            }
                          }
                        }
                      }
                    },
                    "404": { description: "Item not found" }
                  }
                },
                put: {
                  tags: ["Items"],
                  summary: "Update entire item",
                  description: "Replace all fields of an existing item",
                  parameters: [
                    {
                      name: "id",
                      in: "path",
                      required: true,
                      description: "Item ID",
                      schema: { type: "string" }
                    }
                  ],
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/ItemInput" }
                      }
                    }
                  },
                  responses: {
                    "200": {
                      description: "Item updated successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: { $ref: "#/components/schemas/Item" }
                            }
                          }
                        }
                      }
                    },
                    "404": { description: "Item not found" }
                  }
                },
                delete: {
                  tags: ["Items"],
                  summary: "Delete item",
                  description: "Remove an item from inventory",
                  parameters: [
                    {
                      name: "id",
                      in: "path",
                      required: true,
                      description: "Item ID",
                      schema: { type: "string" }
                    }
                  ],
                  responses: {
                    "200": {
                      description: "Item deleted successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              message: { type: "string" }
                            }
                          }
                        }
                      }
                    },
                    "404": { description: "Item not found" }
                  }
                }
              },
              
              "/api/v1/items/search/all": {
                get: {
                  tags: ["Items"],
                  summary: "Search items",
                  description: "Search items by name, category, or stock range",
                  parameters: [
                    {
                      name: "q",
                      in: "query",
                      description: "Search query (name or category)",
                      schema: { type: "string" }
                    },
                    {
                      name: "category",
                      in: "query",
                      description: "Filter by category",
                      schema: { type: "string" }
                    },
                    {
                      name: "minStock",
                      in: "query",
                      description: "Minimum stock quantity",
                      schema: { type: "integer" }
                    },
                    {
                      name: "maxStock",
                      in: "query",
                      description: "Maximum stock quantity",
                      schema: { type: "integer" }
                    }
                  ],
                  responses: {
                    "200": {
                      description: "Search results",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              count: { type: "integer" },
                              data: {
                                type: "array",
                                items: { $ref: "#/components/schemas/Item" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              
              // ==================== SUPPLIERS ENDPOINTS ====================
              "/api/v1/suppliers": {
                get: {
                  tags: ["Suppliers"],
                  summary: "Get all suppliers",
                  description: "Retrieve a list of all suppliers",
                  responses: {
                    "200": {
                      description: "Successful operation",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              count: { type: "integer" },
                              data: {
                                type: "array",
                                items: { $ref: "#/components/schemas/Supplier" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                post: {
                  tags: ["Suppliers"],
                  summary: "Create a new supplier",
                  description: "Add a new supplier",
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/SupplierInput" }
                      }
                    }
                  },
                  responses: {
                    "201": {
                      description: "Supplier created successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: { $ref: "#/components/schemas/Supplier" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              
              "/api/v1/suppliers/{id}": {
                get: {
                  tags: ["Suppliers"],
                  summary: "Get supplier by ID",
                  description: "Retrieve a single supplier by its ID",
                  parameters: [
                    {
                      name: "id",
                      in: "path",
                      required: true,
                      description: "Supplier ID",
                      schema: { type: "string" }
                    }
                  ],
                  responses: {
                    "200": {
                      description: "Successful operation",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: { $ref: "#/components/schemas/SupplierWithItems" }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                put: {
                  tags: ["Suppliers"],
                  summary: "Update entire supplier",
                  description: "Replace all fields of an existing supplier",
                  parameters: [
                    {
                      name: "id",
                      in: "path",
                      required: true,
                      description: "Supplier ID",
                      schema: { type: "string" }
                    }
                  ],
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/SupplierInput" }
                      }
                    }
                  },
                  responses: {
                    "200": {
                      description: "Supplier updated successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: { $ref: "#/components/schemas/Supplier" }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                delete: {
                  tags: ["Suppliers"],
                  summary: "Delete supplier",
                  description: "Remove a supplier (only if no items are associated)",
                  parameters: [
                    {
                      name: "id",
                      in: "path",
                      required: true,
                      description: "Supplier ID",
                      schema: { type: "string" }
                    }
                  ],
                  responses: {
                    "200": {
                      description: "Supplier deleted successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              message: { type: "string" }
                            }
                          }
                        }
                      }
                    },
                    "400": { description: "Supplier has associated items" }
                  }
                }
              },
              
              // ==================== CATEGORIES ENDPOINTS ====================
              "/api/v1/items/categories/all": {
                get: {
                  tags: ["Categories"],
                  summary: "Get all categories",
                  description: "Retrieve a list of all item categories",
                  responses: {
                    "200": {
                      description: "Successful operation",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: {
                                type: "array",
                                items: { type: "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              
              // ==================== REPORTS ENDPOINTS ====================
              "/api/v1/items/reports/inventory": {
                get: {
                  tags: ["Reports"],
                  summary: "Get inventory report",
                  description: "Get comprehensive inventory report with summary and low stock items",
                  responses: {
                    "200": {
                      description: "Report generated successfully",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              success: { type: "boolean" },
                              data: { $ref: "#/components/schemas/InventoryReport" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              
              // ==================== HEALTH ENDPOINT ====================
              "/health": {
                get: {
                  tags: ["Health"],
                  summary: "Health check",
                  description: "Check if the API server is running",
                  responses: {
                    "200": {
                      description: "Server is healthy",
                      content: {
                        "application/json": {
                          schema: {
                            type: "object",
                            properties: {
                              status: { type: "string" },
                              timestamp: { type: "string", format: "date-time" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            
            // ==================== SCHEMA DEFINITIONS ====================
            components: {
              schemas: {
                // Item schemas
                Item: {
                  type: "object",
                  properties: {
                    _id: { type: "string", description: "Unique identifier" },
                    name: { type: "string", description: "Item name" },
                    category: { type: "string", description: "Item category" },
                    stock: { type: "integer", description: "Quantity in stock" },
                    price: { type: "number", description: "Price per unit" },
                    supplier: { 
                      type: "string", 
                      description: "Supplier ID or name" 
                    },
                    description: { 
                      type: "string", 
                      description: "Item description" 
                    },
                    createdAt: { 
                      type: "string", 
                      format: "date-time", 
                      description: "Creation timestamp" 
                    }
                  }
                },
                
                ItemInput: {
                  type: "object",
                  required: ["name", "category"],
                  properties: {
                    name: { type: "string", example: "Laptop" },
                    category: { type: "string", example: "Electronics" },
                    stock: { type: "integer", example: 50 },
                    price: { type: "number", example: 999.99 },
                    supplier: { type: "string", example: "Tech Supplier Inc." },
                    description: { type: "string", example: "High-performance laptop" }
                  }
                },
                
                ItemPartialUpdate: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Updated Laptop" },
                    category: { type: "string", example: "Electronics" },
                    stock: { type: "integer", example: 45 },
                    price: { type: "number", example: 899.99 },
                    supplier: { type: "string", example: "New Tech Supplier" },
                    description: { type: "string", example: "Updated description" }
                  }
                },
                
                // Supplier schemas
                Supplier: {
                  type: "object",
                  properties: {
                    _id: { type: "string", description: "Unique identifier" },
                    name: { type: "string", description: "Supplier name" },
                    contact: { type: "string", description: "Contact person" },
                    phone: { type: "string", description: "Phone number" },
                    email: { type: "string", format: "email", description: "Email address" },
                    address: { type: "string", description: "Physical address" },
                    createdAt: { 
                      type: "string", 
                      format: "date-time", 
                      description: "Creation timestamp" 
                    }
                  }
                },
                
                SupplierWithItems: {
                  allOf: [
                    { $ref: "#/components/schemas/Supplier" },
                    {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Item" },
                          description: "Items supplied by this supplier"
                        }
                      }
                    }
                  ]
                },
                
                SupplierInput: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "Tech Supplier Inc." },
                    contact: { type: "string", example: "John Doe" },
                    phone: { type: "string", example: "+1-234-567-8900" },
                    email: { 
                      type: "string", 
                      format: "email", 
                      example: "contact@techsupplier.com" 
                    },
                    address: { 
                      type: "string", 
                      example: "123 Tech Street, Silicon Valley, CA" 
                    }
                  }
                },
                
                SupplierPartialUpdate: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Updated Supplier Name" },
                    contact: { type: "string", example: "Jane Smith" },
                    phone: { type: "string", example: "+1-987-654-3210" },
                    email: { 
                      type: "string", 
                      format: "email", 
                      example: "jane@supplier.com" 
                    },
                    address: { 
                      type: "string", 
                      example: "456 New Address, San Francisco, CA" 
                    }
                  }
                },
                
                // Report schema
                InventoryReport: {
                  type: "object",
                  properties: {
                    summary: {
                      type: "object",
                      properties: {
                        totalItems: { type: "integer" },
                        totalStock: { type: "integer" },
                        totalValue: { type: "number" }
                      }
                    },
                    byCategory: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string" },
                          itemCount: { type: "integer" },
                          totalStock: { type: "integer" },
                          totalValue: { type: "number" }
                        }
                      }
                    },
                    lowStock: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          stock: { type: "integer" }
                        }
                      }
                    }
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
            layout: "BaseLayout",
            showExtensions: true,
            showCommonExtensions: true
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

console.log("📚 Comprehensive Swagger docs available at /api-docs");

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