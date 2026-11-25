-- Migration 0011: upravitelný text pozvánky (Markdown) pro jednotlivé vlny kampaně

CREATE TABLE IF NOT EXISTS campaign_templates (
  campaign TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  preheader TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
