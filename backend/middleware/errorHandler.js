const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const error = {
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(err.statusCode || 500).json({ error: error.message });
};

module.exports = errorHandler;
