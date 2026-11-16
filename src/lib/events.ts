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

const SOURCE_ENDPOINT = 'https://www.vibecoding.cz/api/event-tips';
/**
 * Kde se nabídka zobrazí. Vibecoding.cz zná Školu AI jako jeden zdroj `skola-ai` (kódovník UTM):
 * v e-mailech jde o medium `email`, které odkazům dává sám, na webu o `referral`, které
 * si přepisujeme tady (řádek kódovníku „náš jiný web“).
 */
export type EventSource = 'skola-ai' | 'skola-ai-email';
const ALLOWED_PREFIX = 'https://www.vibecoding.cz/';
const TIMEOUT_MS = 2500;
const CACHE_SECONDS = 3600;

/** Adresa zdroje akcí. Web i e-maily čtou stejnou adresu, takže sdílejí i cache. */
export function eventTipsUrl(): string {
  return `${SOURCE_ENDPOINT}?source=skola-ai`;
}

/** Odkaz z webu Školy AI: stejná kampaň, ale medium `referral` a bez údajů o vydání e-mailu. */
export function asWebReferral(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', 'skola-ai');
    parsed.searchParams.set('utm_medium', 'referral');
    parsed.searchParams.delete('utm_content');
    parsed.searchParams.delete('utm_term');
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function loadEventTips(limit = 2, source: EventSource = 'skola-ai'): Promise<EventTip[]> {
  try {
    const response = await fetch(eventTipsUrl(), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Cloudflare: sdílená cache odpovědi, aby se zdroj nevolal při každém zobrazení titulky.
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
    } as RequestInit);
    if (!response.ok) return [];
    const data = (await response.json()) as { items?: unknown };
    const tips = parseEventTips(data.items).slice(0, limit);
    return source === 'skola-ai' ? tips.map((tip) => ({ ...tip, url: asWebReferral(tip.url) })) : tips;
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
