const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({
    message: '✅ Inventory API is working!',
    docs: '/api-docs',
    endpoints: [
      'GET /api/v1/items',
      'POST /api/v1/items',
      'GET /api/v1/suppliers',
      'POST /api/v1/suppliers'
    ]
  });
});

// SIMPLE SWAGGER UI
app.get('/api-docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inventory API Docs</title>
      <meta charset="utf-8"/>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui.css">
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
      <script>
        const spec = {
          openapi: "3.0.0",
          info: {
            title: "Inventory API",
            version: "1.0.0"
          },
          servers: [{url: "https://zentinels-inventory-deployment.vercel.app"}],
          paths: {
            "/": {
              get: {
                summary: "Get API info",
                responses: {"200": {description: "Success"}}
              }
            },
            "/api/v1/items": {
              get: {
                summary: "Get all items",
                responses: {"200": {description: "List of items"}}
              },
              post: {
                summary: "Create item",
                requestBody: {
                  content: {
                    "application/json": {
                      example: {
                        name: "Laptop",
                        category: "Electronics",
                        stock: 10,
                        price: 999.99
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ]
        });
      </script>
    </body>
    </html>
  `);
});

// Add your other API endpoints here...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
