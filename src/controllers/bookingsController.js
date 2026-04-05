const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

/**
 * POST /bookings
 * Book a ticket for a user.
 * Decrements remaining_tickets inside a transaction to avoid race conditions.
 * Body: { user_id, event_id }
 */
const createBooking = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { user_id, event_id } = req.body;

    // Lock the event row to prevent concurrent over-booking (SELECT … FOR UPDATE)
    const [[event]] = await conn.query(
      `SELECT id, remaining_tickets FROM events WHERE id = ? FOR UPDATE`,
      [event_id]
    );

    if (!event) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.remaining_tickets <= 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'No tickets remaining for this event.' });
    }

    // Check user exists
    const [[user]] = await conn.query(`SELECT id FROM users WHERE id = ?`, [user_id]);
    if (!user) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check duplicate booking
    const [[existing]] = await conn.query(
      `SELECT id FROM bookings WHERE user_id = ? AND event_id = ?`,
      [user_id, event_id]
    );
    if (existing) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'User has already booked this event.' });
    }

    const booking_code = uuidv4();

    // Insert booking
    const [result] = await conn.query(
      `INSERT INTO bookings (user_id, event_id, booking_code) VALUES (?, ?, ?)`,
      [user_id, event_id, booking_code]
    );

    // Decrement remaining tickets
    await conn.query(
      `UPDATE events SET remaining_tickets = remaining_tickets - 1 WHERE id = ?`,
      [event_id]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      data: {
        booking_id:   result.insertId,
        user_id,
        event_id,
        booking_code,
        booking_date: new Date(),
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * GET /users/:id/bookings
 * Retrieve all bookings made by a specific user.
 */
const getUserBookings = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const [[user]] = await pool.query(`SELECT id, name, email FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [bookings] = await pool.query(
      `SELECT b.id, b.booking_code, b.booking_date,
              e.id AS event_id, e.title, e.description, e.date AS event_date
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [userId]
    );

    res.json({ success: true, data: { user, bookings } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getUserBookings };
