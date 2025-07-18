const express = require('express');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { setupMiddleware } = require('./middleware/common');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware
setupMiddleware(app);

// Test database connection on startup
testConnection();

// Setup routes
app.use('/', routes);

// Error handling middleware
app.use('*', notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

module.exports = app;
