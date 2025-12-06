const mongoose = require('mongoose');

exports.validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format"
    });
  }
  next();
};

exports.validateItem = (req, res, next) => {
  const { name, category, stock, price } = req.body;
  
  if (!name || !category) {
    return res.status(400).json({
      success: false,
      error: "Name and category are required"
    });
  }
  
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return res.status(400).json({
      success: false,
      error: "Stock must be a positive number"
    });
  }
  
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return res.status(400).json({
      success: false,
      error: "Price must be a positive number"
    });
  }
  
  next();
};

exports.validateSupplier = (req, res, next) => {
  const { name, contact, phone, email } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Supplier name is required"
    });
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format"
    });
  }
  
  next();
};