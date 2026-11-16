import type { APIRoute } from 'astro';
import { getAll } from '@lib/db';
import { DELIVERY_SELECT, deliverNextLesson, type DeliveryRow } from '@lib/enrollment';
import { isCronAuthorized } from '@lib/cron';
import { env } from '@lib/env';

/**
 * Kolik zápisů zpracuje jeden běh. Každý zápis = ~4 dotazy do D1 + 1 volání Resendu,
 * takže dávka drží počet podpožadavků i dobu běhu v rozumných mezích.
 * Zbytek doručí další běh (cron běží 3× každé pracovní ráno).
 */
const BATCH_SIZE = 150;

export const POST: APIRoute = async ({ request }) => {
  if (!isCronAuthorized(request)) return new Response('Unauthorized', { status: 401 });

  const due = await getAll<DeliveryRow>(
    env.DB,
    `${DELIVERY_SELECT}
     WHERE e.status = 'active'
       AND e.next_send_at IS NOT NULL
       AND datetime(e.next_send_at) <= datetime('now')
     ORDER BY e.next_send_at
     LIMIT ${BATCH_SIZE}`,
  );

  const results = { due: due.length, sent: 0, completed: 0, skipped: 0, errors: 0 };
  const lessonCache = new Map();

  for (const row of due) {
    try {
      const result = await deliverNextLesson(env, row, { lessonCache });
      if (result.status === 'sent') {
        results.sent++;
        if (result.completed) results.completed++;
      } else if (result.status === 'completed') {
        results.completed++;
      } else {
        results.skipped++;
      }
    } catch (err) {
      results.errors++;
      console.error(`send-lessons: enrollment ${row.id} failed:`, err);
    }
  }

  console.log('send-lessons', JSON.stringify(results));
  return new Response(JSON.stringify({ ok: true, ...results }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
