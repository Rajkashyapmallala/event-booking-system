-- =============================================================
-- Mini Event Management System - Database Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS event_booking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE event_booking_db;

-- -------------------------------------------------------------
-- Table: users
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)    NOT NULL,
  email        VARCHAR(255)    NOT NULL,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table: events
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  title               VARCHAR(200)    NOT NULL,
  description         TEXT,
  date                DATETIME        NOT NULL,
  total_capacity      INT UNSIGNED    NOT NULL,
  remaining_tickets   INT UNSIGNED    NOT NULL,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_events_remaining CHECK (remaining_tickets <= total_capacity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table: bookings
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED    NOT NULL,
  event_id        INT UNSIGNED    NOT NULL,
  booking_date    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  booking_code    VARCHAR(64)     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_code (booking_code),
  UNIQUE KEY uq_bookings_user_event (user_id, event_id),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_event
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table: event_attendance
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_attendance (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  booking_id    INT UNSIGNED    NOT NULL,
  user_id       INT UNSIGNED    NOT NULL,
  event_id      INT UNSIGNED    NOT NULL,
  entry_time    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance_booking (booking_id),
  CONSTRAINT fk_attendance_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_attendance_user
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_attendance_event
    FOREIGN KEY (event_id)   REFERENCES events(id)   ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Sample seed data (optional, comment out for production)
-- -------------------------------------------------------------
INSERT INTO users (name, email) VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith',     'bob@example.com');

INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES
  ('Tech Summit 2026', 'Annual technology conference', '2026-06-15 09:00:00', 200, 200),
  ('Node.js Workshop', 'Hands-on Node.js deep-dive',   '2026-05-10 10:00:00', 50,  50);
