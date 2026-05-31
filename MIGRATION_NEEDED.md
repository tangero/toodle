# Technická migrace – Stav

## Astro v6 + @astrojs/cloudflare breaking change

**Stav**: Vyřešeno v kódu. Soubor zůstává jako historická poznámka k rozhodnutí.

### Problém

Původní problém byl zastaralý pattern:

```ts
const env = locals.runtime.env;           // .astro
const env = locals.runtime.env;           // API routes
const env = Astro.locals.runtime.env;
```

V Astro 6+ a novějších verzích `@astrojs/cloudflare` tento pattern **throwuje** (viz `node_modules/@astrojs/cloudflare/dist/utils/handler.js`).

### Správný nový pattern

```ts
import { env } from 'cloudflare:workers';
// nebo přes helper
import { env } from '@lib/env';
```

### Dopad

Bez této migrace by:
- Lokální vývoj přes `wrangler pages dev` selhával nebo vracel chyby
- Produkční nasazení na Cloudflare by selhalo při prvním requestu

### Odhad pracnosti

Migrace byla provedena přes helper `src/lib/env.ts`.

### Doporučený postup

1. Nový kód má používat `import { env } from '@lib/env'`
2. Nepřidávat nové použití `locals.runtime.env`
3. Při změně Cloudflare adapteru ověřit `npm run build` a `npm run check`

Tato migrace byla identifikována jako technický dluh při analýze v květnu 2026.
