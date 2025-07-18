// Health check controller
const healthCheck = (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

// Test API endpoint
const apiTest = (req, res) => {
  res.json({
    message: 'API endpoint is working!',
    data: {
      server: 'Express',
      database: 'PostgreSQL',
      status: 'connected'
    }
  });
};

// Default route
const defaultRoute = (req, res) => {
  res.json({
    message: '🚀 Bitespeed Express Server is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
};

module.exports = {
  healthCheck,
  apiTest,
  defaultRoute
};
