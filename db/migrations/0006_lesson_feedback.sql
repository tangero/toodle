-- Migration 0006: zpětná vazba na srozumitelnost lekcí (docs/zpetna-vazba-srozumitelnost.md)

-- 1) Verze těla lekce. Import (scripts/import-courses.mjs) i úprava v adminu číslo zvýší,
--    když se změní content_md. Odpovědi čtenářů si pamatují, ke které verzi patří.
ALTER TABLE lessons ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- 2) Odpověď čtenáře na otázku „Jak srozumitelná byla lekce?“. Jedna na zápis a lekci,
--    nová odpověď starou přepíše. Časy ve formátu SQLite (UTC).
--    answer: 1 = rozuměl jsem, 2 = něco mi nesedělo, 3 = nerozuměl jsem.
--    sections_json: označené části lekce, [{"n": pořadí, "title": název}].
--    resent_version: verze lekce, kterou jsme čtenáři poslali po přepisu (jinak NULL).
CREATE TABLE IF NOT EXISTS lesson_feedback (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES enrollments(id),
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  lesson_version INTEGER NOT NULL DEFAULT 1,
  answer INTEGER NOT NULL CHECK (answer IN (1, 2, 3)),
  sections_json TEXT NOT NULL DEFAULT '[]',
  comment TEXT NOT NULL DEFAULT '',
  resent_version INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_feedback_lesson ON lesson_feedback(lesson_id, lesson_version);
