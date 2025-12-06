const express = require("express");
const router = express.Router();
const itemController = require("../controllers/items");
// REMOVE THIS LINE: const validation = require("../middleware/validation");

router.get("/", itemController.getAllItems);
router.get("/:id", itemController.getItemById); // Removed: validation.validateId
router.post("/", itemController.createItem); // Removed: validation.validateItem
router.put("/:id", itemController.updateItem); // Removed validation
router.patch("/:id", itemController.partialUpdateItem); // Removed validation
router.delete("/:id", itemController.deleteItem); // Removed: validation.validateId

// Add these routes here
router.get("/search/all", itemController.searchItems);
router.get("/categories/all", itemController.getCategories);
router.get("/reports/inventory", itemController.getInventoryReport);

module.exports = router;