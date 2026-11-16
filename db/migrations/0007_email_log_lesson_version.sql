-- Migration 0007: verze lekce, která čtenáři odešla

-- Zpětná vazba na srozumitelnost se ukládá k verzi lekce, kterou čtenář dostal, ne k té,
-- která je v databázi ve chvíli odpovědi. Verzi proto zapisujeme při odeslání lekce.
ALTER TABLE email_log ADD COLUMN lesson_version INTEGER;

-- Lekce odeslané před zavedením verzí (migrace 0006) byly všechny verze 1.
UPDATE email_log SET lesson_version = 1 WHERE template = 'lesson' AND lesson_id IS NOT NULL;
