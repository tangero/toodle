-- Migration 0002: opravy po auditu (11/2026)
-- Spuštění: npx wrangler d1 migrations apply skola-ai-db --remote
-- (0001 používá IF NOT EXISTS, takže první `migrations apply` ji bezpečně přeskočí/znovu projde.)

-- 1) Jednotný formát času `YYYY-MM-DD HH:MM:SS` (UTC). ISO hodnoty s "T" se v SQL
--    porovnávaly s datetime('now') špatně (lekce chodily v létě ob den, objednávky vypršely o den později).
UPDATE enrollments SET next_send_at = datetime(next_send_at) WHERE next_send_at LIKE '%T%';
UPDATE orders SET expires_at = datetime(expires_at) WHERE expires_at LIKE '%T%';
UPDATE users SET verified_at = datetime(verified_at) WHERE verified_at LIKE '%T%';
UPDATE users SET created_at = datetime(created_at) WHERE created_at LIKE '%T%';
UPDATE email_log SET opened_at = datetime(opened_at) WHERE opened_at LIKE '%T%';
UPDATE email_log SET clicked_at = datetime(clicked_at) WHERE clicked_at LIKE '%T%';
UPDATE email_log SET bounced_at = datetime(bounced_at) WHERE bounced_at LIKE '%T%';

-- 2) Přihlašovací odkazy: v DB se nově ukládá jen SHA-256 hash tokenu a čas vytvoření
--    (limit odkazů za hodinu). Staré nehashované tokeny zneplatníme.
DELETE FROM magic_links;
ALTER TABLE magic_links ADD COLUMN created_at TEXT;
CREATE INDEX IF NOT EXISTS idx_magic_links_user_created ON magic_links(user_id, created_at);

-- 3) GDPR: dříve smazaní uživatelé měli všichni e-mail 'deleted@deleted' (sloupec je UNIQUE).
UPDATE users SET email = 'deleted-' || id || '@deleted.invalid' WHERE email = 'deleted@deleted';

-- 4) Bezplatné zápisy ověřených uživatelů, které kvůli chybě zůstaly ve stavu pending:
--    aktivovat, první lekci doručí nejbližší běh cronu.
UPDATE enrollments SET status = 'active', started_at = datetime('now'), next_send_at = datetime('now')
WHERE status = 'pending'
  AND course_id IN (SELECT id FROM courses WHERE price_czk = 0)
  AND user_id IN (SELECT id FROM users WHERE verified_at IS NOT NULL AND deleted_at IS NULL);

-- 5) Indexy pro nové dotazy
CREATE INDEX IF NOT EXISTS idx_email_log_lesson ON email_log(lesson_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id, current_lesson);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
