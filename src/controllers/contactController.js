const { pool } = require('../config/database');

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact ORDER BY id');
    res.json({
      success: true,
      message: 'Contacts retrieved successfully',
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new contact with linking logic
const createContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate input - at least one field must be provided
    if (!email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Either email or phoneNumber must be provided'
      });
    }

    // Check if either email or phoneNumber exists in any existing contact
    let searchQuery = 'SELECT * FROM contact WHERE ';
    let searchParams = [];
    let conditions = [];

    if (email) {
      conditions.push('email = $' + (searchParams.length + 1));
      searchParams.push(email);
    }

    if (phoneNumber) {
      conditions.push('phonenumber = $' + (searchParams.length + 1));
      searchParams.push(phoneNumber.toString());
    }

    searchQuery += conditions.join(' OR ') + ' ORDER BY createdat ASC';
    
    const existingContacts = await pool.query(searchQuery, searchParams);

    let linkedId = null;
    let linkPrecedence = 'primary';

    if (existingContacts.rows.length > 0) {
      // Find the oldest contact to be the primary
      const primaryContact = existingContacts.rows[0]; // oldest by createdat ASC
      
      // If there are multiple contacts found, link them all to the oldest (primary)
      if (existingContacts.rows.length > 1) {
        for (let i = 1; i < existingContacts.rows.length; i++) {
          const contactToUpdate = existingContacts.rows[i];
          if (contactToUpdate.linkedid !== primaryContact.id) {
            await pool.query(
              'UPDATE contact SET linkedid = $1, linkprecedence = $2, updatedat = NOW() WHERE id = $3',
              [primaryContact.id, 'secondary', contactToUpdate.id]
            );
          }
        }
      }
      
      linkedId = primaryContact.id;
      linkPrecedence = 'secondary';
    }

    // Create the new contact
    const insertQuery = `
      INSERT INTO contact (phonenumber, email, linkedid, linkprecedence, createdat, updatedat) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING *
    `;
    
    const newContact = await pool.query(insertQuery, [
      phoneNumber?.toString() || null,
      email || null,
      linkedId,
      linkPrecedence
    ]);

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: {
        contact: newContact.rows[0]
      }
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Identify endpoint - Link contacts and return consolidated information
const identifyContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate input - at least one field must be provided
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: 'Either email or phoneNumber must be provided'
      });
    }

    // Find existing contacts with matching email or phone number
    let query = 'SELECT * FROM contact WHERE ';
    let queryParams = [];
    let conditions = [];

    if (email) {
      conditions.push('email = $' + (queryParams.length + 1));
      queryParams.push(email);
    }

    if (phoneNumber) {
      conditions.push('phonenumber = $' + (queryParams.length + 1));
      queryParams.push(phoneNumber.toString());
    }

    query += conditions.join(' OR ') + ' ORDER BY createdat ASC';
    
    const existingContacts = await pool.query(query, queryParams);

    let primaryContact = null;
    let secondaryContacts = [];

    if (existingContacts.rows.length === 0) {
      // No existing contact found - create new primary contact
      const insertQuery = `
        INSERT INTO contact (phonenumber, email, linkedid, linkprecedence, createdat, updatedat) 
        VALUES ($1, $2, $3, $4, NOW(), NOW()) 
        RETURNING *
      `;
      const newContact = await pool.query(insertQuery, [
        phoneNumber?.toString() || null,
        email || null,
        null,
        'primary'
      ]);
      primaryContact = newContact.rows[0];
    } else {
      // Find the primary contact (oldest one or one that's already primary)
      primaryContact = existingContacts.rows.find(contact => contact.linkprecedence === 'primary') 
                      || existingContacts.rows[0];

      // Check if we need to create a new secondary contact
      const exactMatch = existingContacts.rows.find(contact => 
        contact.email === email && contact.phonenumber === phoneNumber?.toString()
      );

      if (!exactMatch) {
        // Create new secondary contact
        const insertQuery = `
          INSERT INTO contact (phonenumber, email, linkedid, linkprecedence, createdat, updatedat) 
          VALUES ($1, $2, $3, $4, NOW(), NOW()) 
          RETURNING *
        `;
        const newSecondaryContact = await pool.query(insertQuery, [
          phoneNumber?.toString() || null,
          email || null,
          primaryContact.id,
          'secondary'
        ]);
        secondaryContacts.push(newSecondaryContact.rows[0]);
      }

      // Update any contacts that should be linked to this primary contact
      if (existingContacts.rows.length > 1) {
        for (const contact of existingContacts.rows) {
          if (contact.id !== primaryContact.id && contact.linkedid !== primaryContact.id) {
            await pool.query(
              'UPDATE contact SET linkedid = $1, linkprecedence = $2, updatedat = NOW() WHERE id = $3',
              [primaryContact.id, 'secondary', contact.id]
            );
            secondaryContacts.push(contact);
          } else if (contact.id !== primaryContact.id) {
            secondaryContacts.push(contact);
          }
        }
      }
    }

    // Get all related contacts (primary + all secondaries)
    const allRelatedQuery = `
      SELECT * FROM contact 
      WHERE id = $1 OR linkedid = $1 
      ORDER BY linkprecedence DESC, createdat ASC
    `;
    const allRelated = await pool.query(allRelatedQuery, [primaryContact.id]);

    // Build the response
    const emails = [];
    const phoneNumbers = [];
    const secondaryContactIds = [];

    // Add primary contact data first
    if (primaryContact.email) emails.push(primaryContact.email);
    if (primaryContact.phonenumber) phoneNumbers.push(primaryContact.phonenumber);

    // Add secondary contact data
    for (const contact of allRelated.rows) {
      if (contact.id !== primaryContact.id) {
        secondaryContactIds.push(contact.id);
        
        // Add unique emails and phone numbers
        if (contact.email && !emails.includes(contact.email)) {
          emails.push(contact.email);
        }
        if (contact.phonenumber && !phoneNumbers.includes(contact.phonenumber)) {
          phoneNumbers.push(contact.phonenumber);
        }
      }
    }

    res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: emails,
        phoneNumbers: phoneNumbers,
        secondaryContactIds: secondaryContactIds
      }
    });

  } catch (error) {
    console.error('Error in identify endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllContacts,
  createContact,
  identifyContact
};
