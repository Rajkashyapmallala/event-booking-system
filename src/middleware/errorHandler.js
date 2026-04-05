const { validationResult } = require('express-validator');

/**
 * Runs express-validator checks and returns 422 on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * Global error handler – must be registered last.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status  = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
};

module.exports = { validate, errorHandler };
