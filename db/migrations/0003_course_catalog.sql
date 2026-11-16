-- Migration 0003: údaje pro katalog kurzů na titulce (redesign 11/2026)
-- audience = pro koho kurz je, requirements = co je potřeba umět a mít,
-- sort_order = pořadí v katalogu (menší je výš; první kurz je doporučený na titulce).
ALTER TABLE courses ADD COLUMN audience TEXT NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN requirements TEXT NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 100;

UPDATE courses
SET audience = 'Pro úplné začátečníky.',
    requirements = 'Nic umět nemusíte, stačí bezplatný účet ChatGPT.',
    sort_order = 10
WHERE slug = 'chatgpt-pro-zacatecniky';
