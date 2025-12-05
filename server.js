require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/inventory_db";

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log("âœ… MongoDB Connected"))
  .catch(err => console.error("âŒ MongoDB Connection Error:", err));

// Define schemas
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  stock: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  supplier: String
});

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: String,
  phone: String,
  email: String,
  address: String
});

const Item = mongoose.model("Item", itemSchema);
const Supplier = mongoose.model("Supplier", supplierSchema);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "í³¦ Inventory API is running!",
    endpoints: [
      "GET /api/v1/items",
      "POST /api/v1/items",
      "GET /api/v1/suppliers",
      "POST /api/v1/suppliers"
    ]
  });
});

// Items
app.get("/api/v1/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/v1/items", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Suppliers
app.get("/api/v1/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/v1/suppliers", async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`íº€ Server running on http://localhost:${PORT}`);
});
