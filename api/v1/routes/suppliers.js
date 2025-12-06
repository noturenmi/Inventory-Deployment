const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/suppliers");

router.get("/", supplierController.getAllSuppliers);
router.get("/:id", supplierController.getSupplierById); // Removed: validation.validateId
router.post("/", supplierController.createSupplier); // Removed: validation.validateSupplier
router.put("/:id", supplierController.updateSupplier); // Removed validation
router.patch("/:id", supplierController.partialUpdateSupplier); // Removed validation
router.delete("/:id", supplierController.deleteSupplier); // Removed: validation.validateId

module.exports = router;