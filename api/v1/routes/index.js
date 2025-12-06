const express = require("express");
const router = express.Router();

const itemRoutes = require("./items");
const supplierRoutes = require("./suppliers");
const itemController = require("../controllers/items");

router.use("/items", itemRoutes);
router.use("/suppliers", supplierRoutes);

// ✅ Move these routes to the items.routes.js file (see below)
// router.get("/categories", itemController.getCategories);
// router.get("/reports/inventory", itemController.getInventoryReport);
// router.get("/search", itemController.searchItems);

module.exports = router;