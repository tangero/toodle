-- Migration 0001: Initial schema
-- Run with: wrangler d1 execute letni-skola-ai-db --file=./db/migrations/0001_initial.sql

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  verified_at TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  perex TEXT NOT NULL DEFAULT '',
  description_md TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '',
  price_czk INTEGER NOT NULL DEFAULT 0,
  lesson_count INTEGER NOT NULL DEFAULT 0,
  delivery_mode TEXT NOT NULL DEFAULT 'next_workday' CHECK (delivery_mode IN ('on_click', 'next_workday')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  welcome_email_md TEXT NOT NULL DEFAULT '',
  completion_email_md TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL DEFAULT '',
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  UNIQUE(course_id, position)
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, position);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'stalled', 'completed', 'cancelled')),
  current_lesson INTEGER NOT NULL DEFAULT 1,
  next_send_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  score INTEGER,
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status_send ON enrollments(status, next_send_at);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  enrollment_id TEXT REFERENCES enrollments(id),
  vs TEXT NOT NULL UNIQUE,
  amount_czk INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'overpaid', 'underpaid')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  expires_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_vs ON orders(vs);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  fio_transaction_id TEXT NOT NULL UNIQUE,
  vs TEXT NOT NULL,
  amount_czk INTEGER NOT NULL,
  received_at TEXT NOT NULL,
  matched_order_id TEXT REFERENCES orders(id),
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_vs ON payments(vs);
CREATE INDEX IF NOT EXISTS idx_payments_fio ON payments(fio_transaction_id);

-- Email log
CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT REFERENCES enrollments(id),
  lesson_id TEXT REFERENCES lessons(id),
  template TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  resend_id TEXT,
  opened_at TEXT,
  clicked_at TEXT,
  bounced_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_log_enrollment ON email_log(enrollment_id, template);
CREATE INDEX IF NOT EXISTS idx_email_log_resend ON email_log(resend_id);

-- Tests
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL UNIQUE REFERENCES courses(id),
  questions_json TEXT NOT NULL DEFAULT '[]'
);

-- Test attempts
CREATE TABLE IF NOT EXISTS test_attempts (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES enrollments(id),
  answers_json TEXT NOT NULL DEFAULT '{}',
  score INTEGER,
  feedback_json TEXT,
  llm_evaluation_raw TEXT,
  completed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_enrollment ON test_attempts(enrollment_id);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL UNIQUE REFERENCES enrollments(id),
  public_id TEXT NOT NULL UNIQUE,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  pdf_r2_key TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_certificates_public ON certificates(public_id);

-- Magic links
CREATE TABLE IF NOT EXISTS magic_links (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used_at TEXT
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
