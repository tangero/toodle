-- Migration 0008: obce a statistika obcí

-- Číselník obcí ČR. Klíčem je kód obce (ČSÚ/RÚIAN). Data plní migrace 0009
-- (skript scripts/obce/build_obce.py), počet obyvatel je od ČSÚ.
-- IČO slouží jen k převodu obcí ze staré aplikace, kde se obec ukládala podle IČO.
CREATE TABLE IF NOT EXISTS municipalities (
  code INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL,
  population INTEGER NOT NULL,
  ico TEXT
);

-- Obec, kde uživatel žije. Nepovinná, vyplňuje se při zápisu do kurzu nebo v nastavení účtu.
-- Veřejně se ukazuje jen souhrnně ve statistice obcí (/obce).
ALTER TABLE users ADD COLUMN municipality_code INTEGER REFERENCES municipalities(code);

CREATE INDEX IF NOT EXISTS idx_users_municipality ON users(municipality_code);

-- Obec zadaná při zápisu bez přihlášení. Do users.municipality_code se přenese až potvrzením
-- e-mailového odkazu, aby cizí člověk nemohl měnit obec existujícímu účtu.
ALTER TABLE enrollments ADD COLUMN pending_municipality_code INTEGER REFERENCES municipalities(code);
