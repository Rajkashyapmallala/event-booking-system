require('dotenv').config();
const express    = require('express');
const path       = require('path');
const yaml       = require('js-yaml');
const fs         = require('fs');
const swaggerUi  = require('swagger-ui-express');

const eventsRouter   = require('./routes/events');
const bookingsRouter = require('./routes/bookings');
const { errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());

// ── Swagger UI ───────────────────────────────────────────────
const swaggerDoc = yaml.load(
  fs.readFileSync(path.join(__dirname, '../docs/swagger.yaml'), 'utf8')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ── Routes ───────────────────────────────────────────────────
app.use('/events',  eventsRouter);
app.use('/bookings', bookingsRouter);
app.use('/users',    bookingsRouter);   // GET /users/:id/bookings re-uses bookingsRouter

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at  http://localhost:${PORT}/api-docs`);
});

module.exports = app;
