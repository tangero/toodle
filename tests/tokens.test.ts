import { describe, expect, it } from 'vitest';
import {
  createFeedbackToken, createPromoOptOutToken, createRatingToken, createUnsubscribeToken,
  verifyFeedbackToken, verifyPromoOptOutToken, verifyRatingToken, verifyUnsubscribeToken,
} from '@lib/unsubscribe';

const SECRET = 'test-secret';
const ID = '01HZXK3V5N8Q2R7T9W4YB6C0DE';

describe('podepsané tokeny z e-mailů', () => {
  it('token odhlášení z kurzu má stále původní podobu (odkazy v odeslaných e-mailech platí dál)', async () => {
    // Vzorek spočítaný původní implementací: HMAC-SHA256 nad holým id zápisu.
    const legacy = `${ID}.72152c3892a0735778d31abcc26b83c959fa77fd3877a5942b5a21706cd27516`;
    expect(await createUnsubscribeToken(ID, SECRET)).toBe(legacy);
    expect(await verifyUnsubscribeToken(legacy, SECRET)).toBe(ID);
  });

  it('každý účel ověří svůj token', async () => {
    expect(await verifyPromoOptOutToken(await createPromoOptOutToken(ID, SECRET), SECRET)).toBe(ID);
    expect(await verifyRatingToken(await createRatingToken(ID, SECRET), SECRET)).toBe(ID);
  });

  it('token jednoho účelu neprojde ověřením jiného', async () => {
    const course = await createUnsubscribeToken(ID, SECRET);
    const promo = await createPromoOptOutToken(ID, SECRET);
    const rating = await createRatingToken(ID, SECRET);
    expect(new Set([course, promo, rating]).size).toBe(3);

    expect(await verifyPromoOptOutToken(course, SECRET)).toBeNull();
    expect(await verifyRatingToken(course, SECRET)).toBeNull();
    expect(await verifyUnsubscribeToken(promo, SECRET)).toBeNull();
    expect(await verifyRatingToken(promo, SECRET)).toBeNull();
    expect(await verifyUnsubscribeToken(rating, SECRET)).toBeNull();
    expect(await verifyPromoOptOutToken(rating, SECRET)).toBeNull();
  });

  it('podpis účelu nejde přebalit na token kurzu s id „promo:…“', async () => {
    const promo = await createPromoOptOutToken(ID, SECRET);
    const sig = promo.slice(promo.lastIndexOf('.') + 1);
    // Podpis nad zprávou `promo:<id>` by jako token kurzu seděl na id `promo:<id>`.
    expect(await verifyUnsubscribeToken(`promo:${ID}.${sig}`, SECRET)).toBeNull();
    expect(await verifyUnsubscribeToken(`rating:${ID}.${sig}`, SECRET)).toBeNull();
  });

  it('poškozený token neprojde', async () => {
    const token = await createPromoOptOutToken(ID, SECRET);
    const flipped = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    expect(await verifyPromoOptOutToken(flipped, SECRET)).toBeNull();
    expect(await verifyPromoOptOutToken(token.slice(0, -4), SECRET)).toBeNull();
    expect(await verifyPromoOptOutToken(token.replace(ID, '01HZXK3V5N8Q2R7T9W4YB6C0DF'), SECRET)).toBeNull();
    expect(await verifyPromoOptOutToken(ID, SECRET)).toBeNull();
    expect(await verifyPromoOptOutToken('', SECRET)).toBeNull();
    expect(await verifyPromoOptOutToken(`.${token.split('.')[1]}`, SECRET)).toBeNull();
    expect(await verifyPromoOptOutToken(`${'a'.repeat(300)}.abc`, SECRET)).toBeNull();
  });

  it('token podepsaný jiným klíčem neprojde', async () => {
    const token = await createRatingToken(ID, 'jiny-klic');
    expect(await verifyRatingToken(token, SECRET)).toBeNull();
  });

  describe('zpětná vazba na srozumitelnost lekce', () => {
    const LESSON = 'lekce-2';

    it('ověří svůj token a vrátí zápis i id lekce', async () => {
      const token = await createFeedbackToken(ID, LESSON, SECRET);
      expect(token.startsWith(`${ID}.${LESSON}.`)).toBe(true);
      expect(await verifyFeedbackToken(token, SECRET)).toEqual({ enrollmentId: ID, lessonId: LESSON });
    });

    it('token s id lekce ve tvaru ULID se vejde do limitu délky', async () => {
      const ulid = 'A'.repeat(26);
      const token = await createFeedbackToken(ulid, ulid, SECRET);
      expect(token.length).toBeLessThanOrEqual(200);
      expect(await verifyFeedbackToken(token, SECRET)).toEqual({ enrollmentId: ulid, lessonId: ulid });
    });

    it('token zpětné vazby neprojde ověřením ostatních účelů', async () => {
      const feedback = await createFeedbackToken(ID, LESSON, SECRET);
      expect(await verifyUnsubscribeToken(feedback, SECRET)).toBeNull();
      expect(await verifyPromoOptOutToken(feedback, SECRET)).toBeNull();
      expect(await verifyRatingToken(feedback, SECRET)).toBeNull();
    });

    it('tokeny ostatních účelů neprojdou jako zpětná vazba', async () => {
      const others = [
        await createUnsubscribeToken(ID, SECRET),
        await createPromoOptOutToken(ID, SECRET),
        await createRatingToken(ID, SECRET),
      ];
      for (const token of others) {
        expect(await verifyFeedbackToken(token, SECRET)).toBeNull();
        // Ani s doplněným id lekce: podpis je nad jinou zprávou.
        const [id, sig] = token.split('.');
        expect(await verifyFeedbackToken(`${id}.${LESSON}.${sig}`, SECRET)).toBeNull();
      }
    });

    it('podpis zpětné vazby nejde přebalit na token jiného účelu', async () => {
      const feedback = await createFeedbackToken(ID, LESSON, SECRET);
      const sig = feedback.slice(feedback.lastIndexOf('.') + 1);
      for (const forged of [`${ID}.${sig}`, `feedback:${ID}:${LESSON}.${sig}`, `${ID}:${LESSON}.${sig}`, `${ID}.${LESSON}.${sig}`]) {
        expect(await verifyUnsubscribeToken(forged, SECRET)).toBeNull();
        expect(await verifyPromoOptOutToken(forged, SECRET)).toBeNull();
        expect(await verifyRatingToken(forged, SECRET)).toBeNull();
      }
    });

    it('lekci ani zápis v tokenu nejde zaměnit', async () => {
      const token = await createFeedbackToken(ID, LESSON, SECRET);
      const sig = token.slice(token.lastIndexOf('.') + 1);
      expect(await verifyFeedbackToken(`${ID}.lekce-3.${sig}`, SECRET)).toBeNull();
      expect(await verifyFeedbackToken(`jiny-zapis.${LESSON}.${sig}`, SECRET)).toBeNull();
    });

    it('hranici mezi id zápisu a id lekce nejde posunout', async () => {
      // Dvojtečku ani tečku id neobsahují, takže zprávu „zápis:lekce“ nejde složit dvěma způsoby.
      const token = await createFeedbackToken('ab', 'cd', SECRET);
      const sig = token.slice(token.lastIndexOf('.') + 1);
      expect(await verifyFeedbackToken(`a.bcd.${sig}`, SECRET)).toBeNull();
      expect(await verifyFeedbackToken(`abc.d.${sig}`, SECRET)).toBeNull();
    });

    it('odmítne neplatné id lekce a poškozený token', async () => {
      const token = await createFeedbackToken(ID, LESSON, SECRET);
      const sig = token.slice(token.lastIndexOf('.') + 1);
      for (const lesson of ['', ' ', 'a:b', 'a b', 'a/b', 'x'.repeat(65)]) {
        expect(await verifyFeedbackToken(`${ID}.${lesson}.${sig}`, SECRET)).toBeNull();
      }
      expect(await verifyFeedbackToken(token.slice(0, -4), SECRET)).toBeNull();
      expect(await verifyFeedbackToken('', SECRET)).toBeNull();
      expect(await verifyFeedbackToken(`${'a'.repeat(300)}.${LESSON}.abc`, SECRET)).toBeNull();
      expect(await verifyFeedbackToken(await createFeedbackToken(ID, LESSON, 'jiny-klic'), SECRET)).toBeNull();
      await expect(createFeedbackToken(ID, '', SECRET)).rejects.toThrow();
      await expect(createFeedbackToken(ID, 'a:b', SECRET)).rejects.toThrow();
      await expect(createFeedbackToken(ID, 3 as unknown as string, SECRET)).rejects.toThrow();
    });
  });
});
