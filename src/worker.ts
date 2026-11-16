/**
 * Vstupní bod Workeru: HTTP obsluhuje Astro, crony běží ve stejném Workeru.
 *
 * Scheduled handler volá cron endpointy interně přes `handle()` – bez veřejné sítě,
 * bez závislosti na DNS/custom doméně a bez samostatného cron workeru.
 * Mapování cron výrazů musí sedět s `triggers.crons` ve wrangler.jsonc.
 */
import { handle } from '@astrojs/cloudflare/handler';
import type { ExecutionContext, ScheduledController } from '@cloudflare/workers-types';

interface CronJob {
  endpoint: string;
  heartbeat?: 'BETTERSTACK_HEARTBEAT_LESSONS' | 'BETTERSTACK_HEARTBEAT_PAYMENTS' | 'BETTERSTACK_HEARTBEAT_REMINDERS' | 'BETTERSTACK_HEARTBEAT_DIGEST';
}

const CRON_MAP: Record<string, CronJob[]> = {
  // 05/06/07 UTC = pokrývá 7:00 pražského času v zimě (06 UTC) i v létě (05 UTC);
  // pozdější běhy doručí, co předchozí nestihl nebo kde selhalo odeslání.
  '0 5,6,7 * * 1-5': [{ endpoint: '/api/cron/send-lessons', heartbeat: 'BETTERSTACK_HEARTBEAT_LESSONS' }],
  '*/30 * * * *': [{ endpoint: '/api/cron/match-payments', heartbeat: 'BETTERSTACK_HEARTBEAT_PAYMENTS' }],
  '0 7 * * *': [
    { endpoint: '/api/cron/reminders', heartbeat: 'BETTERSTACK_HEARTBEAT_REMINDERS' },
    { endpoint: '/api/cron/expire-orders' },
    { endpoint: '/api/cron/cleanup' },
  ],
  '0 16 * * *': [{ endpoint: '/api/cron/admin-digest', heartbeat: 'BETTERSTACK_HEARTBEAT_DIGEST' }],
};

type WorkerEnv = Record<string, unknown>;
type HandleArgs = Parameters<typeof handle>;

export default {
  fetch: handle,


  async scheduled(controller: ScheduledController, env: WorkerEnv, ctx: ExecutionContext) {
    const jobs = CRON_MAP[controller.cron];
    if (!jobs) {
      console.error(`Unknown cron expression: ${controller.cron}`);
      return;
    }

    // FIO platby se zatím nepoužívají – bez tokenu párování přeskočíme.
    for (const job of jobs) {
      if (job.endpoint === '/api/cron/match-payments' && !env.FIO_API_TOKEN) continue;
      try {
        const request = new Request(`${String(env.APP_URL)}${job.endpoint}`, {
          method: 'POST',
          headers: { 'X-Cron-Secret': String(env.CRON_SECRET) },
        });
        const res = await handle(request, env as unknown as HandleArgs[1], ctx as unknown as HandleArgs[2]);
        const body = await res.text();
        console.log(`${job.endpoint}: ${res.status} ${body.slice(0, 500)}`);

        const heartbeatUrl = job.heartbeat ? env[job.heartbeat] : undefined;
        if (res.ok && typeof heartbeatUrl === 'string' && heartbeatUrl) {
          ctx.waitUntil(fetch(heartbeatUrl).catch(() => {}));
        }
      } catch (err) {
        console.error(`${job.endpoint} failed:`, err);
      }
    }
  },
};
