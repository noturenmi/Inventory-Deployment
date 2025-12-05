const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/suppliers");
const validation = require("../middleware/validation");

// GET all suppliers
router.get("/", supplierController.getAllSuppliers);

// GET single supplier
router.get("/:id", supplierController.getSupplierById);

// POST create new supplier
router.post("/", validation.validateSupplier, supplierController.createSupplier);

// PUT update entire supplier
router.put("/:id", validation.validateSupplier, supplierController.updateSupplier);

// PATCH partial update
router.patch("/:id", validation.validateSupplierPartial, supplierController.partialUpdateSupplier);

// DELETE supplier
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;