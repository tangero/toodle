-- Migration 0005: opravy z code review PR #2 (11/2026)

-- 1) Potvrzovací odkaz zápisu je vázaný na konkrétní zápis. Běžné přihlášení už nespouští
--    čekající kurzy, které pod stejným e-mailem mohl založit kdokoli přes veřejný formulář.
ALTER TABLE magic_links ADD COLUMN enrollment_id TEXT;

-- 2) Číslo průchodu kurzem. Opakovaný zápis po odhlášení dostane nové číslo a s ním nové
--    Idempotency-Key e-mailů, jinak by Resend lekce do 24 hodin potlačil jako duplicitní.
ALTER TABLE enrollments ADD COLUMN run_no INTEGER NOT NULL DEFAULT 1;

-- 3) Zámek odesílání lekce. Dokud jeden požadavek čeká na Resend, druhý (dvojklik, jiná karta,
--    souběžný cron) nepošle další lekci. Zámek starší než 10 minut se považuje za opuštěný.
ALTER TABLE enrollments ADD COLUMN sending_at TEXT;
