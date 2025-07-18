const express = require('express');
const cors = require('cors');

// Common middleware setup
const setupMiddleware = (app) => {
  // CORS middleware
  app.use(cors());
  
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Request logging middleware (optional)
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
};

module.exports = {
  setupMiddleware
};
