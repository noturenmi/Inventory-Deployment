const Item = require("../models/Item");
const Supplier = require("../models/Supplier");

// GET all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate("supplier", "name contact email");
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error("Error getting items:", error);
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};

// GET single item
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("supplier");
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid item ID"
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};

// POST create new item
exports.createItem = async (req, res) => {
  try {
    // Check if supplier exists
    if (req.body.supplier) {
      const supplier = await Supplier.findById(req.body.supplier);
      if (!supplier) {
        return res.status(400).json({
          success: false,
          error: "Supplier not found"
        });
      }
    }
    
    const item = new Item(req.body);
    await item.save();
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Item with this name already exists"
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PUT update entire item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("supplier");
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// PATCH partial update
exports.partialUpdateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("supplier");
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};

// Search items
exports.searchItems = async (req, res) => {
  try {
    const { q, category, minStock, maxStock } = req.query;
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (minStock) query.stock = { $gte: Number(minStock) };
    if (maxStock) query.stock = { $lte: Number(maxStock) };
    
    const items = await Item.find(query).populate("supplier");
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Item.distinct("category");
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};

// Get inventory report
exports.getInventoryReport = async (req, res) => {
  try {
    const items = await Item.find().populate("supplier");

    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = items.reduce((sum, item) => sum + item.stock * item.price, 0);

    const byCategory = {};
    items.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = { count: 0, totalStock: 0, totalValue: 0 };
      }
      byCategory[item.category].count += 1;
      byCategory[item.category].totalStock += item.stock;
      byCategory[item.category].totalValue += item.stock * item.price;
    });

    const categorySummary = Object.keys(byCategory).map(cat => ({
      category: cat,
      itemCount: byCategory[cat].count,
      totalStock: byCategory[cat].totalStock,
      totalValue: byCategory[cat].totalValue
    }));

    const lowStock = items.filter(item => item.stock <= 5);

    res.status(200).json({
      success: true,
      data: {
        summary: { totalItems, totalStock, totalValue },
        byCategory: categorySummary,
        lowStock: lowStock.map(item => ({
          id: item._id,
          name: item.name,
          stock: item.stock
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error"
    });
  }
};
