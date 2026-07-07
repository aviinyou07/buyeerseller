const { error } = require('../utils/response.utils');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error Stack:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = process.env.NODE_ENV === 'development' ? err.stack : null;

  return error(res, message, statusCode, errors);
};

module.exports = errorHandler;
