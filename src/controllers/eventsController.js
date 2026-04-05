const pool = require('../config/db');

/**
 * GET /events
 * List all upcoming events.
 */
const listEvents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, date, total_capacity, remaining_tickets, created_at
       FROM events
       WHERE date > NOW()
       ORDER BY date ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /events
 * Create a new event.
 * Body: { title, description?, date, capacity }
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description = '', date, capacity } = req.body;
    
        // Convert ISO 8601 (e.g. "2026-05-10T10:00:00Z") → MySQL DATETIME ("2026-05-10 10:00:00")
    const mysqlDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(
      `INSERT INTO events (title, description, date, total_capacity, remaining_tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, mysqlDate, capacity, capacity]
    );

    const [[event]] = await pool.query(
      `SELECT * FROM events WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

module.exports = { listEvents, createEvent };
