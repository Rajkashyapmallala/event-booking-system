# Mini Event Management System

A RESTful API for browsing events, booking tickets, and recording attendance.
Built with **Node.js**, **Express.js**, and **MySQL**.

---

## Project Structure

```
event-booking-system/
├── src/
│   ├── app.js                        # Entry point
│   ├── config/
│   │   └── db.js                     # MySQL connection pool
│   ├── controllers/
│   │   ├── eventsController.js
│   │   ├── bookingsController.js
│   │   └── attendanceController.js
│   ├── routes/
│   │   ├── events.js
│   │   └── bookings.js
│   └── middleware/
│       └── errorHandler.js
├── docs/
│   ├── swagger.yaml                  # OpenAPI 3.0 spec
│   └── EventBookingSystem.postman_collection.json
├── schema.sql                        # MySQL schema export
├── .env.example
├── package.json
└── README.md
```

---

## Prerequisites

| Tool      | Version  |
|-----------|----------|
| Node.js   | ≥ 18.x   |
| npm       | ≥ 9.x    |
| MySQL     | ≥ 8.0    |

---

## Database Setup

1. Start your MySQL server.

2. Create the database and tables by importing the schema:

```bash
mysql -u root -p < schema.sql
```

This will:
- Create the `event_booking_db` database
- Create `users`, `events`, `bookings`, and `event_attendance` tables with proper constraints
- Insert two seed users and two seed events

---

## Running the Server

1. **Clone / extract** the project and navigate into the folder:

```bash
cd event-booking-system
```

2. **Install dependencies**:

```bash
npm install
```

3. **Configure environment variables** – copy the example file and edit it:

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_booking_db
PORT=3000
```

4. **Start the server**:

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

The server will be available at **http://localhost:3000**.

---

## API Endpoints

| Method | Endpoint                  | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| GET    | `/events`                 | List all upcoming events                      |
| POST   | `/events`                 | Create a new event                            |
| POST   | `/bookings`               | Book a ticket (transactional, race-safe)      |
| GET    | `/users/:id/bookings`     | Get all bookings for a specific user          |
| POST   | `/events/:id/attendance`  | Check in with a booking code                  |

---

## API Documentation (Swagger UI)

Interactive docs are served automatically when the server is running:

```
http://localhost:3000/api-docs
```

The raw spec is at `docs/swagger.yaml`.

---

## Postman Collection

Import `docs/EventBookingSystem.postman_collection.json` into Postman.

The collection includes:
- Pre-populated request bodies for every endpoint
- Example success and error responses
- A **test script** on `POST /bookings` that automatically saves the returned `booking_code` to the `bookingCode` collection variable, which is then used by `POST /events/:id/attendance`.

### Suggested test order

1. `GET /events` – confirm seed events exist
2. `POST /events` – create an event
3. `POST /bookings` – book a ticket (saves `bookingCode` automatically)
4. `GET /users/1/bookings` – confirm the booking appears
5. `POST /events/1/attendance` – check in using `{{bookingCode}}`

---

## Key Technical Decisions

### Race Condition Prevention
`POST /bookings` wraps the availability check and ticket decrement in a single **MySQL transaction** using `SELECT … FOR UPDATE` to lock the event row. This prevents two simultaneous requests from over-booking the same event.

### Unique Booking Codes
Each booking receives a **UUID v4** as its `booking_code`. UUIDs are collision-resistant and opaque to end-users.

### Input Validation
All endpoints use **express-validator** rules. Invalid inputs return `422 Unprocessable Entity` with a structured errors array.

### Error Handling
A single global error handler middleware catches all unhandled errors and returns consistent `{ success, message }` JSON responses.
