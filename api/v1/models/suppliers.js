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
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"]
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"]
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, "Please enter a valid website URL"]
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Pending"],
    default: "Active"
  },
  paymentTerms: {
    type: String,
    enum: ["Net 30", "Net 60", "COD", "Advance"],
    default: "Net 30"
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

// Create index for search
supplierSchema.index({ name: 'text', email: 'text' });

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;