const Supplier = require("../models/Supplier");
const Item = require("../models/Item");

// GET all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};

// GET single supplier
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found"
      });
    }
    
    // Get items from this supplier
    const items = await Item.find({ supplier: supplier._id });
    
    res.status(200).json({
      success: true,
      data: {
        ...supplier.toObject(),
        items: items
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid supplier ID"
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};

// POST create new supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    
    res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Supplier with this name already exists"
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PUT update entire supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PATCH partial update
exports.partialUpdateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE supplier
exports.deleteSupplier = async (req, res) => {
  try {
    // Check if supplier has items
    const itemsCount = await Item.countDocuments({ supplier: req.params.id });
    
    if (itemsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete supplier. It has ${itemsCount} associated items.`
      });
    }
    
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};