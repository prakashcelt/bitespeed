const express = require('express');
const router = express.Router();
const { healthCheck, apiTest, defaultRoute } = require('../controllers/generalController');

// Default route
router.get('/', defaultRoute);

// Health check route
router.get('/health', healthCheck);

// API test route
router.get('/api/test', apiTest);

module.exports = router;
