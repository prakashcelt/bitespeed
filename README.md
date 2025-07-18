# Bitespeed Identity Reconciliation Service

A Node.js Express server for customer identity tracking and reconciliation across multiple purchases on FluxKart.com. Intelligently links customer contacts based on email and phone number overlap.

## 🏗️ Project Structure

```
src/
├── config/
│   └── database.js          # Database configuration and connection
├── controllers/
│   ├── contactController.js  # Contact business logic
│   └── generalController.js  # General API controllers
├── middleware/
│   ├── common.js            # Common middleware setup
│   └── errorHandlers.js     # Error handling middleware
├── routes/
│   ├── index.js             # Main route aggregator
│   ├── contactRoutes.js     # Contact-related routes
│   └── generalRoutes.js     # General routes
└── server.js                # Main application entry point
```

## 🚀 Features

- ✅ **Identity Reconciliation** - Automatically links customer contacts across purchases
- ✅ **Contact Consolidation** - Merges customer data with email/phone overlap detection  
- ✅ **Primary/Secondary Linking** - Maintains oldest contact as primary, others as secondary
- ✅ **Smart Contact Creation** - Creates secondary contacts for new information combinations
- ✅ **PostgreSQL Integration** - Robust database with connection pooling
- ✅ **RESTful API** - Clean endpoints for contact management and identification
- ✅ **Error Handling** - Comprehensive validation and error responses
- ✅ **Environment Configuration** - Secure environment variable management
- ✅ **CORS Support** - Cross-origin resource sharing enabled

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Environment variables are configured in `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bitespeed
   DB_USER=postgres
   DB_PASSWORD=Celt@1234
   ```

3. **Database Setup:**
   Ensure PostgreSQL is running and the `bitespeed` database exists with a `contact` table.

## 🏃‍♂️ Running the Server

### Development (with auto-restart):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### General Endpoints
- `GET /` - Server status and welcome message
- `GET /health` - Health check endpoint
- `GET /api/test` - API connectivity test

### Contact Management
- `GET /api/contacts` - Retrieve all contacts
- `POST /api/contacts` - Create new contact with automatic linking logic
- `POST /identify` - **Main endpoint** - Identify and consolidate contact information

### Key Functionality

The `/identify` endpoint is the core feature that:
1. Finds existing contacts with matching email or phone number
2. Consolidates all related contact information
3. Returns unified customer identity with primary/secondary contact structure
4. Creates new contacts when needed for identity tracking

## 🎯 API Usage Examples

### Create New Contact (FluxKart Checkout)
Creates a new contact when a customer places an order. Automatically links to existing contacts if email or phone number overlap is detected.

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}'
```

### Identify Contact (Main Feature)
Consolidates customer identity across all their contact information. Returns unified view of customer data.

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'
```

**Response Format:**
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

### Get All Contacts (Debug/Admin)
```bash
curl http://localhost:3000/api/contacts
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run clean` - Clean install dependencies

### Code Organization
- **Controllers**: Business logic and data processing
- **Routes**: HTTP route definitions and middleware attachment
- **Middleware**: Reusable middleware functions
- **Config**: Configuration files and database connections

## 🛡️ Error Handling

The application includes comprehensive error handling:
- Input validation with meaningful error messages
- Database connection error handling
- Global error middleware for unhandled exceptions
- Development vs production error responses

## 🗃️ Database Schema

The contact table stores customer identity information with linking relationships:

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

### Contact Linking Logic

- **Primary Contact**: The oldest contact in a linked group (`linkedid = null`, `linkprecedence = 'primary'`)
- **Secondary Contact**: Newer contacts linked to primary (`linkedid = primary_id`, `linkprecedence = 'secondary'`)
- **Linking Trigger**: Contacts are linked when they share email OR phone number
- **Identity Consolidation**: All linked contacts represent the same customer

### Example Data Structure

Customer places two orders with different email/phone combinations:

```sql
-- First order: email=lorraine@hillvalley.edu, phone=123456
{
  id: 1,
  phoneNumber: "123456",
  email: "lorraine@hillvalley.edu", 
  linkedId: null,
  linkPrecedence: "primary"
}

-- Second order: email=mcfly@hillvalley.edu, phone=123456 (same phone!)
{
  id: 23,
  phoneNumber: "123456", 
  email: "mcfly@hillvalley.edu",
  linkedId: 1,              -- Links to first contact
  linkPrecedence: "secondary"
}
```

Both contacts represent the same customer identity.

## 🤝 Contributing

1. Follow the established MVC folder structure
2. Add new routes in the appropriate route files
3. Keep business logic in controllers
4. Use middleware for common functionality
5. Maintain the contact linking logic integrity
6. Update this README for any new features

## 📋 Use Cases

- **E-commerce Identity Tracking**: Track customers across multiple purchases on FluxKart.com
- **Customer Data Consolidation**: Merge customer profiles when they use different email/phone combinations
- **Marketing Personalization**: Unified customer view for targeted campaigns
- **Customer Support**: Complete customer history across all contact methods
- **Analytics**: Accurate customer metrics without duplicate counting
