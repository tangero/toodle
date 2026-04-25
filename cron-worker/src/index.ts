interface Env {
  APP_URL: string;
  CRON_SECRET: string;
  BETTERSTACK_HEARTBEAT_LESSONS?: string;
  BETTERSTACK_HEARTBEAT_PAYMENTS?: string;
  BETTERSTACK_HEARTBEAT_REMINDERS?: string;
  BETTERSTACK_HEARTBEAT_DIGEST?: string;
}

interface CronJob {
  endpoint: string;
  heartbeatKey?: keyof Env;
}

const CRON_MAP: Record<string, CronJob[]> = {
  '0 5,6,7 * * 1-5': [{ endpoint: '/api/cron/send-lessons', heartbeatKey: 'BETTERSTACK_HEARTBEAT_LESSONS' }],
  '*/30 * * * *': [{ endpoint: '/api/cron/match-payments', heartbeatKey: 'BETTERSTACK_HEARTBEAT_PAYMENTS' }],
  '0 7 * * *': [
    { endpoint: '/api/cron/reminders', heartbeatKey: 'BETTERSTACK_HEARTBEAT_REMINDERS' },
    { endpoint: '/api/cron/expire-orders' },
  ],
  '0 16 * * *': [{ endpoint: '/api/cron/admin-digest', heartbeatKey: 'BETTERSTACK_HEARTBEAT_DIGEST' }],
};

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const jobs = CRON_MAP[event.cron];
    if (!jobs) {
      console.error(`Unknown cron expression: ${event.cron}`);
      return;
    }

    for (const job of jobs) {
      try {
        const url = `${env.APP_URL}${job.endpoint}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'X-Cron-Secret': env.CRON_SECRET },
        });
        const body = await res.text();
        console.log(`${job.endpoint}: ${res.status} ${body}`);

        if (res.ok && job.heartbeatKey && env[job.heartbeatKey]) {
          ctx.waitUntil(fetch(env[job.heartbeatKey] as string).catch(() => {}));
        }
      } catch (err) {
        console.error(`${job.endpoint} failed:`, err);
      }
    }
  },
};
