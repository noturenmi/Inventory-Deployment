const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Supplier name is required"],
    trim: true,
    maxlength: [100, "Supplier name cannot exceed 100 characters"],
    unique: true
  },
  contact: {
    type: String,
    trim: true,
    maxlength: [100, "Contact name cannot exceed 100 characters"]
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
supplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
