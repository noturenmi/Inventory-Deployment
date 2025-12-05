const express = require("express");
const router = express.Router();

// Import route modules
const itemRoutes = require("./items");
const supplierRoutes = require("./suppliers");

// Import controllers
const itemController = require("../controllers/items");
const supplierController = require("../controllers/suppliers");

// Item routes
router.use("/items", itemRoutes);

// Supplier routes
router.use("/suppliers", supplierRoutes);

// Additional endpoints
router.get("/categories", itemController.getCategories);
router.get("/reports/inventory", itemController.getInventoryReport);

// Search endpoint
router.get("/search", itemController.searchItems);

// Export the router
module.exports = router;