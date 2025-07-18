# Bitespeed Identity Reconciliation Service

A robust Node.js Express API for customer identity tracking and reconciliation. Intelligently links customer contacts based on email and phone number overlap to provide unified customer profiles.

## 🚀 Live API

**Base URL:** `https://bitespeed-itni.onrender.com`

## 🎯 API Endpoints

### 1. Identity Reconciliation (Primary Endpoint)

**POST** `/identify`

Consolidates customer identity across all their contact information and returns a unified view.

#### Request Body
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

*Note: At least one of email or phoneNumber must be provided*

#### Response Format
```json
{
  "contact": {
    "primaryContactId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
```

#### Example Request
```bash
curl -X POST https://bitespeed-itni.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}'
```

#### Example Response
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

#### Error Responses
```json
// 400 Bad Request
{
  "error": "Either email or phoneNumber must be provided"
}

// 500 Internal Server Error
{
  "error": "Internal server error"
}
```

### 2. Contact Management

#### Get All Contacts
**GET** `/api/contacts`

Retrieves all contacts from the database.

#### Response
```json
{
  "success": true,
  "message": "Contacts retrieved successfully",
  "count": number,
  "data": [
    {
      "id": number,
      "phonenumber": "string",
      "email": "string",
      "linkedid": number,
      "linkprecedence": "primary|secondary",
      "createdat": "timestamp",
      "updatedat": "timestamp"
    }
  ]
}
```

#### Create New Contact
**POST** `/api/contacts`

Creates a new contact with automatic linking logic.

#### Request Body
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

#### Response
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
    "contact": {
      "id": number,
      "phonenumber": "string",
      "email": "string",
      "linkedid": number,
      "linkprecedence": "primary|secondary",
      "createdat": "timestamp",
      "updatedat": "timestamp"
    }
  }
}
```

### 3. Health & Status Endpoints

#### Health Check
**GET** `/health`

Returns server health status and uptime.

#### Response
```json
{
  "status": "healthy",
  "uptime": number,
  "timestamp": "ISO 8601 timestamp"
}
```

#### Server Status
**GET** `/`

Returns basic server information.

#### Response
```json
{
  "message": "🚀 Bitespeed Express Server is running!",
  "status": "success",
  "timestamp": "ISO 8601 timestamp",
  "environment": "production|development"
}
```

#### API Test
**GET** `/api/test`

Tests API connectivity and database status.

#### Response
```json
{
  "message": "API endpoint is working!",
  "data": {
    "server": "Express",
    "database": "PostgreSQL",
    "status": "connected"
  }
}
```

## 🏗️ Contact Linking Logic

The service implements intelligent contact linking:

- **Primary Contact**: The oldest contact in a linked group (`linkedid = null`)
- **Secondary Contact**: Newer contacts linked to primary (`linkedid = primary_id`)
- **Linking Trigger**: Contacts are automatically linked when they share email OR phone number
- **Identity Consolidation**: All linked contacts represent the same customer identity

### Example Scenario

1. Customer places order with: `email: "lorraine@hillvalley.edu", phone: "123456"`
   - Creates primary contact (ID: 1)

2. Same customer places another order with: `email: "mcfly@hillvalley.edu", phone: "123456"`
   - Creates secondary contact (ID: 23) linked to primary (ID: 1)

3. Calling `/identify` with either email or phone returns consolidated identity:
   ```json
   {
     "contact": {
       "primaryContactId": 1,
       "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
       "phoneNumbers": ["123456"],
       "secondaryContactIds": [23]
     }
   }
   ```

## 🛡️ Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid input parameters
- **404 Not Found**: Route not found
- **500 Internal Server Error**: Database or server errors

Error responses follow consistent format:
```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

## 🗃️ Database Schema

```sql
CREATE TABLE contact (
  id SERIAL PRIMARY KEY,
  phonenumber VARCHAR(50),
  email VARCHAR(255),
  linkedid INTEGER,
  linkprecedence VARCHAR(20) CHECK (linkprecedence IN ('primary', 'secondary')),
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedat TIMESTAMP NULL
);
```

## 🚀 Quick Start

Test the API with these curl commands:

```bash
# Test server health
curl https://bitespeed-itni.onrender.com/health

# Identify a contact
curl -X POST https://bitespeed-itni.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "phoneNumber": "1234567890"}'

# Get all contacts
curl https://bitespeed-itni.onrender.com/api/contacts

# Create a new contact
curl -X POST https://bitespeed-itni.onrender.com/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"email": "new@example.com", "phoneNumber": "9876543210"}'
```

## 🎯 Use Cases

- **E-commerce Platforms**: Track customers across multiple purchases
- **CRM Systems**: Unified customer profiles with contact deduplication
- **Marketing Automation**: Consolidated customer data for personalized campaigns
- **Customer Support**: Complete customer interaction history
- **Analytics**: Accurate customer metrics without duplicate counting

## 📊 Features

- ✅ **Automatic Identity Linking** - Links contacts based on email/phone overlap
- ✅ **Primary/Secondary Hierarchy** - Maintains chronological contact precedence
- ✅ **RESTful API Design** - Clean, intuitive endpoint structure
- ✅ **Comprehensive Error Handling** - Detailed error responses and validation
- ✅ **PostgreSQL Integration** - Robust database with connection pooling
- ✅ **Production Ready** - Deployed on Render with SSL support
- ✅ **CORS Enabled** - Cross-origin resource sharing support

---

**API Base URL:** `https://bitespeed-itni.onrender.com`

For technical support or questions about the API, please refer to the endpoint documentation above.