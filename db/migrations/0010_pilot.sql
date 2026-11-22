-- Migration 0010: pilotní pozvánka a odpovědi na připomínky k lekcím

-- Příjemci rozesílky (kampaně). Seznam se zmrazí jednou (skript scripts/pilot/zmrazit_prijemce.py)
-- a posílá se jen z něj, takže opakované odeslání nepokračuje dalšími lidmi.
-- status: pending → sending → sent | failed | skipped (mezitím odhlásil nabídky nebo smazal účet).
CREATE TABLE IF NOT EXISTS campaign_recipients (
  campaign TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  sending_at TEXT,
  sent_at TEXT,
  resend_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (campaign, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_user ON campaign_recipients(user_id);

-- Vysvětlení, které čtenáři posíláme na jeho připomínku k lekci. Návrh píše jazykový model
-- (jen na kliknutí v adminu), odeslání vždy schvaluje člověk. Jedna odpověď na připomínku.
-- status: draft → sending → sent.
CREATE TABLE IF NOT EXISTS feedback_replies (
  id TEXT PRIMARY KEY,
  feedback_id TEXT NOT NULL UNIQUE REFERENCES lesson_feedback(id),
  body TEXT NOT NULL DEFAULT '',
  model TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent')),
  sending_at TEXT,
  sent_at TEXT,
  resend_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
