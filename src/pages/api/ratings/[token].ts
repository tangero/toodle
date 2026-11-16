import type { APIRoute } from 'astro';
import { generateId, getOne, run } from '@lib/db';
import { verifyRatingToken } from '@lib/unsubscribe';
import { parseRatingInput } from '@lib/ratings';
import { toSqlDateTime } from '@lib/time';
import { logAudit } from '@lib/audit';
import { checkRateLimit, clientIp } from '@lib/rate-limit';
import { env } from '@lib/env';

/**
 * Uložení hodnocení kurzu z formuláře na /hodnoceni/[token].
 *
 * Formulář se odesílá bez JavaScriptu, proto endpoint odpovídá přesměrováním (303)
 * zpět na stránku, která podle parametru `stav` ukáže poděkování nebo chybu.
 * Token je HMAC vázaný na zápis; přihlášení není potřeba. Opakované odeslání
 * dřívější hodnocení přepíše (jedno hodnocení na zápis).
 */
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const token = params.token ?? '';
  const back = (stav: string) => redirect(`/hodnoceni/${encodeURIComponent(token)}?stav=${stav}`, 303);

  const enrollmentId = await verifyRatingToken(token, env.JWT_SECRET);
  if (!enrollmentId) return new Response('Odkaz na hodnocení není platný.', { status: 400 });

  if (!(await checkRateLimit(env, `rating:${clientIp(request)}`))) return back('limit');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back('chyba');
  }

  const parsed = parseRatingInput({
    score: form.get('score'),
    comment: form.get('comment'),
    publishConsent: form.get('publish_consent'),
  });
  if (!parsed.ok) return back(parsed.error === 'score' ? 'znamka' : 'text');

  const enrollment = await getOne<{ id: string }>(
    env.DB,
    `SELECT e.id FROM enrollments e
     JOIN users u ON u.id = e.user_id AND u.deleted_at IS NULL
     WHERE e.id = ?`,
    enrollmentId,
  );
  if (!enrollment) return new Response('Odkaz na hodnocení není platný.', { status: 400 });

  const { score, comment, publishConsent } = parsed.value;
  await run(
    env.DB,
    `INSERT INTO course_ratings (id, enrollment_id, score, comment, publish_consent, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(enrollment_id) DO UPDATE SET
       score = excluded.score,
       comment = excluded.comment,
       publish_consent = excluded.publish_consent,
       created_at = excluded.created_at`,
    generateId(),
    enrollmentId,
    score,
    comment,
    publishConsent ? 1 : 0,
    toSqlDateTime(new Date()),
  );
  // Text hodnocení do auditu nepatří (osobní údaj, při smazání účtu by v logu zůstal).
  await logAudit(env.DB, 'rating', 'rating.saved', enrollmentId, {
    score, has_comment: comment.length > 0, publish_consent: publishConsent,
  });

  return back('ulozeno');
};
