// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Contact Link Precedence
const LINK_PRECEDENCE = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary'
};

// API Messages
const MESSAGES = {
  CONTACT: {
    RETRIEVED_SUCCESS: 'Contacts retrieved successfully',
    CREATED_SUCCESS: 'Contact created successfully',
    VALIDATION_ERROR: 'Either email or phoneNumber must be provided',
    FETCH_ERROR: 'Failed to retrieve contacts',
    CREATE_ERROR: 'Failed to create contact'
  },
  GENERAL: {
    SERVER_RUNNING: '🚀 Bitespeed Express Server is running!',
    ROUTE_NOT_FOUND: 'Route not found',
    SOMETHING_WRONG: 'Something went wrong!',
    API_WORKING: 'API endpoint is working!',
    HEALTHY: 'healthy'
  },
  IDENTIFY: {
    VALIDATION_ERROR: 'Either email or phoneNumber must be provided',
    INTERNAL_ERROR: 'Internal server error'
  }
};

// Database Queries
const QUERIES = {
  GET_ALL_CONTACTS: 'SELECT * FROM contact ORDER BY id',
  INSERT_CONTACT: `
    INSERT INTO contact (phonenumber, email, linkedid, linkprecedence, createdat, updatedat) 
    VALUES ($1, $2, $3, $4, NOW(), NOW()) 
    RETURNING *
  `,
  UPDATE_CONTACT_LINK: `
    UPDATE contact 
    SET linkedid = $1, linkprecedence = $2, updatedat = NOW() 
    WHERE id = $3 
    RETURNING *
  `,
  GET_RELATED_CONTACTS: `
    SELECT * FROM contact 
    WHERE id = $1 OR linkedid = $1 
    ORDER BY linkprecedence DESC, createdat ASC
  `
};

module.exports = {
  HTTP_STATUS,
  LINK_PRECEDENCE,
  MESSAGES,
  QUERIES
};
