const express = require('express');
const { body, param } = require('express-validator');
const { listEvents, createEvent }   = require('../controllers/eventsController');
const { recordAttendance }           = require('../controllers/attendanceController');
const { validate }                   = require('../middleware/errorHandler');

const router = express.Router();

// GET /events
router.get('/', listEvents);

// POST /events
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    body('date').isISO8601().withMessage('date must be a valid ISO 8601 datetime'),
    body('capacity')
      .isInt({ min: 1 })
      .withMessage('capacity must be a positive integer'),
  ],
  validate,
  createEvent
);

// POST /events/:id/attendance
router.post(
  '/:id/attendance',
  [
    param('id').isInt({ min: 1 }).withMessage('event id must be a positive integer'),
    body('booking_code').trim().notEmpty().withMessage('booking_code is required'),
  ],
  validate,
  recordAttendance
);

module.exports = router;
