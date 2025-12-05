const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/suppliers");
const validation = require("../middleware/validation");

router.get("/", supplierController.getAllSuppliers);
router.get("/:id", validation.validateId, supplierController.getSupplierById);
router.post("/", validation.validateSupplier, supplierController.createSupplier);
router.put("/:id", validation.validateId, validation.validateSupplier, supplierController.updateSupplier);
router.patch("/:id", validation.validateId, validation.validateSupplier, supplierController.partialUpdateSupplier);
router.delete("/:id", validation.validateId, supplierController.deleteSupplier);

module.exports = router;
