/**
 * Unified API Response Helpers
 */

/*
 * Send a success response
 * @param {Object} res - Express response object
 * @param {String} message - Message description
 * @param {Object|Array} data - Data payload
 * @param {Number} statusCode - HTTP status code
 */
const success = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {String} message - Error description
 * @param {Number} statusCode - HTTP status code
 * @param {Object|Array|null} errors - Specific validation or system errors
 */
const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message
  };
  
  if (errors) {
    payload.errors = errors;
  }
  
  return res.status(statusCode).json(payload);
};

/**
 * Send a paginated success response
 * @param {Object} res - Express response object
 * @param {String} message - Message description
 * @param {Array} items - Paginated data items
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page limit
 * @param {Number} totalItems - Total count of items in database
 * @param {Number} statusCode - HTTP status code
 */
const paginate = (res, message = 'Success', items = [], page = 1, limit = 10, totalItems = 0, statusCode = 200) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: parseInt(limit, 10),
        totalPages,
        currentPage: parseInt(page, 10),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }
  });
};

module.exports = {
  success,
  error,
  paginate
};
