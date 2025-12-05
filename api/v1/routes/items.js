const express = require("express");
const router = express.Router();
const itemController = require("../controllers/items");
const validation = require("../middleware/validation");

router.get("/", itemController.getAllItems);
router.get("/:id", validation.validateId, itemController.getItemById);
router.post("/", validation.validateItem, itemController.createItem);
router.put("/:id", validation.validateId, validation.validateItem, itemController.updateItem);
router.patch("/:id", validation.validateId, validation.validateItem, itemController.partialUpdateItem);
router.delete("/:id", validation.validateId, itemController.deleteItem);
router.get("/search", itemController.searchItems);

module.exports = router;
