const pool = require('../config/db');

/**
 * POST /events/:id/attendance
 * Takes a booking_code, validates it belongs to the event,
 * records the entry, and returns total tickets booked for the event.
 * Body: { booking_code }
 */
const recordAttendance = async (req, res, next) => {
  try {
    const event_id     = parseInt(req.params.id, 10);
    const { booking_code } = req.body;

    // Validate event exists
    const [[event]] = await pool.query(
      `SELECT id, title, total_capacity FROM events WHERE id = ?`,
      [event_id]
    );
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Validate booking code belongs to this event
    const [[booking]] = await pool.query(
      `SELECT b.id, b.user_id, b.event_id
       FROM bookings b
       WHERE b.booking_code = ? AND b.event_id = ?`,
      [booking_code, event_id]
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Invalid booking code for this event.' });
    }

    // Check if already checked in
    const [[attended]] = await pool.query(
      `SELECT id FROM event_attendance WHERE booking_id = ?`,
      [booking.id]
    );
    if (attended) {
      return res.status(409).json({ success: false, message: 'This booking has already been checked in.' });
    }

    // Record attendance
    await pool.query(
      `INSERT INTO event_attendance (booking_id, user_id, event_id) VALUES (?, ?, ?)`,
      [booking.id, booking.user_id, event_id]
    );

    // Count total tickets booked for this event
    const [[{ tickets_booked }]] = await pool.query(
      `SELECT COUNT(*) AS tickets_booked FROM bookings WHERE event_id = ?`,
      [event_id]
    );

    res.status(201).json({
      success: true,
      data: {
        event_id,
        event_title:    event.title,
        tickets_booked: Number(tickets_booked),
        total_capacity: event.total_capacity,
        entry_time:     new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { recordAttendance };
