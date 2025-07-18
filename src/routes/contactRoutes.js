const express = require('express');
const router = express.Router();
const { getAllContacts, createContact, identifyContact } = require('../controllers/contactController');

// GET /api/contacts - Get all contacts
router.get('/', getAllContacts);

// POST /api/contacts - Create new contact
router.post('/', createContact);

// POST /identify - Identify and link contacts
router.post('/identify', identifyContact);

module.exports = router;
