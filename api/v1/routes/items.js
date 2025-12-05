const express = require("express");
const router = express.Router();
const itemController = require("../controllers/items");
const validation = require("../middleware/validation");

// GET all items
router.get("/", itemController.getAllItems);

// GET single item
router.get("/:id", itemController.getItemById);

// POST create new item
router.post("/", validation.validateItem, itemController.createItem);

// PUT update entire item
router.put("/:id", validation.validateItem, itemController.updateItem);

// PATCH partial update
router.patch("/:id", validation.validateItemPartial, itemController.partialUpdateItem);

// DELETE item
router.delete("/:id", itemController.deleteItem);

// Search items
router.get("/search", itemController.searchItems);

module.exports = router;