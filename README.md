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
   
   **For Local Development (.env file):**
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bitespeed
   DB_USER=postgres
   DB_PASSWORD=Celt@1234
   ```
   
   **For Production (Render Environment Variables):**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://bitespeed_y9te_user:7stUbnMBE7s46xSa3D9sDu5PS7APvprZ@dpg-d1t3scruibrs738s8000-a.oregon-postgres.render.com:5432/bitespeed_y9te
   ```

3. **Database Setup:**
   Ensure PostgreSQL is running and the `bitespeed` database exists with a `contact` table.

## 🚀 Deployment on Render

### Step 1: Deploy PostgreSQL Database

1. **Create PostgreSQL Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "PostgreSQL"
   - Choose a name: `bitespeed-database`
   - Select region closest to your users
   - Choose plan (Free tier available)
   - Click "Create Database"

2. **Get Database Connection Details:**
   After creation, Render provides:
   - **External Database URL** (for external connections)
   - **Internal Database URL** (for Render services)
   - Host, Port, Database Name, Username, Password

3. **Create Database Table:**
   Connect to your database using the provided credentials and run:
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

### Step 2: Deploy Node.js Application

1. **Create Web Service on Render:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `bitespeed-api`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

2. **Set Environment Variables:**
   In the Render dashboard, add these environment variables:
   
   **Option 1: Using DATABASE_URL (Recommended)**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://bitespeed_y9te_user:7stUbnMBE7s46xSa3D9sDu5PS7APvprZ@dpg-d1t3scruibrs738s8000-a.oregon-postgres.render.com:5432/bitespeed_y9te
   ```
   
   **Option 2: Using Individual Variables**
   ```env
   NODE_ENV=production
   DB_HOST=dpg-d1t3scruibrs738s8000-a.oregon-postgres.render.com
   DB_PORT=5432
   DB_NAME=bitespeed_y9te
   DB_USER=bitespeed_y9te_user
   DB_PASSWORD=7stUbnMBE7s46xSa3D9sDu5PS7APvprZ
   ```

3. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Your app will be available at: `https://bitespeed-api.onrender.com`

### Step 3: Update Database Configuration

Update your `src/config/database.js` to handle Render's environment:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bitespeed',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Celt@1234',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### Important Notes for Render Deployment:

- **Database URL**: Use the **Internal Database URL** for better performance
- **SSL**: Render requires SSL connections in production
- **Port**: Render automatically assigns port (usually 10000)
- **Free Tier Limitations**: 
  - Apps sleep after 15 minutes of inactivity
  - Database has connection limits
  - Consider paid plans for production use

## 🏃‍♂️ Running the Server

### Local Development:
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will start on `http://localhost:3000` (local) or assigned port (Render)

### 🚀 Quick Deployment Checklist

- [ ] Create PostgreSQL database on Render
- [ ] Note down database connection details
- [ ] Run the CREATE TABLE SQL script
- [ ] Push your code to GitHub repository
- [ ] Create Web Service on Render connected to your repo
- [ ] Set environment variables (DATABASE_URL or individual DB vars)
- [ ] Ensure `src/config/database.js` handles SSL for production
- [ ] Deploy and test the endpoints

**Production URL Structure:**
- API Base: `https://your-app-name.onrender.com`
- Health Check: `https://your-app-name.onrender.com/health`
- Identify Endpoint: `https://your-app-name.onrender.com/identify`

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
