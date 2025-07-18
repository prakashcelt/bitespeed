const express = require('express');
const contactRoutes = require('./contactRoutes');
const generalRoutes = require('./generalRoutes');

const router = express.Router();

// General routes (/, /health, /api/test)
router.use('/', generalRoutes);

// Contact routes (/api/contacts, /identify)
router.use('/api/contacts', contactRoutes);

// Move identify to root level as per requirements
router.post('/identify', require('../controllers/contactController').identifyContact);

module.exports = router;
