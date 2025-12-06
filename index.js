const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '✅ Inventory API is working!',
    status: 'Deployed on Vercel',
    endpoints: {
      items: {
        getAll: 'GET /api/v1/items',
        create: 'POST /api/v1/items'
      },
      suppliers: {
        getAll: 'GET /api/v1/suppliers',
        create: 'POST /api/v1/suppliers'
      }
    }
  });
});

app.get('/api/v1/items', (req, res) => {
  res.json({
    success: true,
    message: 'Items endpoint - MongoDB connection needed',
    count: 0,
    data: []
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = app;
