const express = require('express');
const { body, param } = require('express-validator');
const { createBooking, getUserBookings } = require('../controllers/bookingsController');
const { validate }                        = require('../middleware/errorHandler');

const router = express.Router();

// POST /bookings
router.post(
  '/',
  [
    body('user_id').isInt({ min: 1 }).withMessage('user_id must be a positive integer'),
    body('event_id').isInt({ min: 1 }).withMessage('event_id must be a positive integer'),
  ],
  validate,
  createBooking
);

// GET /users/:id/bookings  – mounted under /users in app.js
router.get(
  '/:id/bookings',
  [param('id').isInt({ min: 1 }).withMessage('user id must be a positive integer')],
  validate,
  getUserBookings
);

module.exports = router;
