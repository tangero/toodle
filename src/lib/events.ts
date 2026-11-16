/**
 * Nejbližší akce z propagačního systému Vibecoding.cz (sekce „Další naše AI vzdělávání“).
 * Čte veřejný výstup pro cizí weby a newslettery. Když zdroj neodpoví včas nebo vrátí
 * něco nečekaného, vrací prázdný seznam a sekce se nezobrazí. Stránka na něm nesmí záviset.
 */

export interface EventTip {
  label: string;
  title: string;
  meta: string;
  url: string;
}

const SOURCE_URL = 'https://www.vibecoding.cz/api/event-tips?source=skola-ai';
const ALLOWED_PREFIX = 'https://www.vibecoding.cz/';
const TIMEOUT_MS = 2500;
const CACHE_SECONDS = 3600;

export async function loadEventTips(limit = 2): Promise<EventTip[]> {
  try {
    const response = await fetch(SOURCE_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Cloudflare: sdílená cache odpovědi, aby se zdroj nevolal při každém zobrazení titulky.
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
    } as RequestInit);
    if (!response.ok) return [];
    const data = (await response.json()) as { items?: unknown };
    return parseEventTips(data.items).slice(0, limit);
  } catch {
    return [];
  }
}

/** Propustí jen položky s textovými poli a odkazem na vibecoding.cz. */
export function parseEventTips(items: unknown): EventTip[] {
  if (!Array.isArray(items)) return [];
  const tips: EventTip[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const { label, title, meta, url } = item as Record<string, unknown>;
    if (typeof title !== 'string' || !title.trim()) continue;
    if (typeof url !== 'string' || !url.startsWith(ALLOWED_PREFIX)) continue;
    tips.push({
      label: typeof label === 'string' ? label : '',
      title: title.trim(),
      meta: typeof meta === 'string' ? meta : '',
      url,
    });
  }
  return tips;
}
