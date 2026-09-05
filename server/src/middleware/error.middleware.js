const errorHandler = (err, req, res, next) => {
  // 8. SERVER-SIDE LOGGING: Log detailed technical information on the server
  console.error('[Error Handler] Technical Details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
    detail: err.detail,
    hint: err.hint,
    table: err.table,
    constraint: err.constraint,
    original: err.original,
    parent: err.parent
  });
  
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // 6. JOI VALIDATION
  if (err.isJoi) {
    statusCode = 422; // Unprocessable Entity
    message = err.details && err.details[0] ? err.details[0].message : 'Validation failed';
  }

  // 4. POSTGRESQL ERROR HANDLING (Ensure it's a DB error, often they have 'severity' or known string codes)
  if (err.code && typeof err.code === 'string' && err.code.length === 5) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409; // Conflict
        message = err.detail || 'A record with that information already exists.';
        break;
      case '22P02': // invalid_text_representation (e.g., bad UUID)
        statusCode = 400; // Bad Request
        message = err.message || 'Invalid identifier format.';
        break;
      case '23503': // foreign_key_violation
        statusCode = 404; // Not Found
        message = err.detail || 'Related resource not found.';
        break;
      case '23502': // not_null_violation
        statusCode = 400; // Bad Request
        message = err.detail || err.message || 'Missing required field.';
        break;
      case '23514': // check_violation
        statusCode = 400; // Bad Request
        message = err.detail || err.message || 'Data validation check failed.';
        break;
    }
  }

  // 10. UNKNOWN ERRORS / Hide sensitive info for 500 errors
  if (statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
