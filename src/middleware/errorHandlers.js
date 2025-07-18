// 404 handler middleware
const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
