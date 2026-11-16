-- Migration 0004: nabídky dalšího vzdělávání v e-mailech a hodnocení kurzů (11/2026)

-- Odhlášení nabídek („Další naše AI vzdělávání“ pod lekcemi). NULL = nabídky chce.
-- Lekce chodí dál bez ohledu na tuto volbu.
ALTER TABLE users ADD COLUMN promo_opt_out_at TEXT;

-- Kdy odešla žádost o hodnocení kurzu (jednou, tři dny po dokončení). NULL = zatím neodešla.
ALTER TABLE enrollments ADD COLUMN rating_requested_at TEXT;

-- Zápisy dokončené dřív než tři dny před nasazením žádost nedostanou: nasazení by jinak
-- rozeslalo žádosti naráz všem dřívějším absolventům. Hodnota je jen značka „vyřízeno“.
-- Kdo dokončil v posledních třech dnech, dostane žádost běžným způsobem.
UPDATE enrollments SET rating_requested_at = datetime('now')
WHERE status = 'completed' AND rating_requested_at IS NULL
  AND (completed_at IS NULL OR datetime(completed_at) <= datetime('now', '-3 days'));

-- Hodnocení kurzu: jedno na zápis, opakované odeslání ho přepíše.
-- publish_consent = 1: souhlas se zveřejněním pod křestním jménem.
CREATE TABLE IF NOT EXISTS course_ratings (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL UNIQUE REFERENCES enrollments(id),
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  publish_consent INTEGER NOT NULL DEFAULT 0 CHECK (publish_consent IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_enrollments_rating_request ON enrollments(status, rating_requested_at);
