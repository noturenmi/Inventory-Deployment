require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const v1Routes = require("./api/v1/routes");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests" }
});
app.use(limiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("âœ… MongoDB Connected"))
  .catch(err => console.error("âŒ MongoDB Error:", err));

// Swagger Documentation
try {
  const swaggerDocument = YAML.load("./api/v1/docs/swagger.yaml");
  app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("í³š Swagger docs at /api/v1/api-docs");
} catch (err) {
  console.log("âš ï¸ Swagger disabled:", err.message);
}

// Routes
app.use("/api/v1", v1Routes);

// Root
app.get("/", (req, res) => {
  res.json({
    message: "í³¦ Inventory API v1.0",
    docs: "/api/v1/api-docs",
    endpoints: {
      items: "/api/v1/items",
      suppliers: "/api/v1/suppliers",
      categories: "/api/v1/categories",
      reports: "/api/v1/reports/inventory"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`íº€ Server: http://localhost:${PORT}`);
});
