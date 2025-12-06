const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'âœ… Inventory API is working!',
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

// ================ ENHANCED SWAGGER DOCUMENTATION ================
// Serve Swagger UI with enhanced features
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: '/swagger.json',
        name: 'Inventory API v1.0'
      }
    ],
    validatorUrl: null,
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    displayOperationId: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    persistAuthorization: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-size: 36px; }
    .swagger-ui .info .description { font-size: 16px; }
    .swagger-ui .opblock-tag { font-size: 24px; }
    .swagger-ui .model { font-size: 14px; }
    .try-out { display: block !important }
    .try-out__btn { background-color: #4990e2 !important }
    .execute { background-color: #49cc90 !important }
  `,
  customSiteTitle: "Inventory API Documentation",
  customfavIcon: "/favicon.ico"
};

// Serve Swagger UI at multiple endpoints
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(require('./swagger.json'), swaggerOptions));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(require('./swagger.json'), swaggerOptions));

// Serve raw Swagger JSON
app.get("/swagger.json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'swagger.json'));
});

// Add a redirect from old endpoint
app.get("/api/v1/api-docs", (req, res) => {
  res.redirect("/api-docs");
});

console.log("í³š Enhanced Swagger documentation available at:");
console.log("   - https://zentinels-inventory-deployment.vercel.app/api-docs");
console.log("   - https://zentinels-inventory-deployment.vercel.app/docs");
console.log("   - https://zentinels-inventory-deployment.vercel.app/swagger.json");
