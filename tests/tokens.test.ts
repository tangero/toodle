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
    it('ověří svůj token a vrátí zápis i pozici lekce', async () => {
      const token = await createFeedbackToken(ID, 3, SECRET);
      expect(token.startsWith(`${ID}.3.`)).toBe(true);
      expect(await verifyFeedbackToken(token, SECRET)).toEqual({ enrollmentId: ID, lessonPosition: 3 });
    });

    it('token zpětné vazby neprojde ověřením ostatních účelů', async () => {
      const feedback = await createFeedbackToken(ID, 1, SECRET);
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
        // Ani s doplněnou pozicí: podpis je nad jinou zprávou.
        const [id, sig] = token.split('.');
        expect(await verifyFeedbackToken(`${id}.1.${sig}`, SECRET)).toBeNull();
      }
    });

    it('podpis zpětné vazby nejde přebalit na token jiného účelu', async () => {
      const feedback = await createFeedbackToken(ID, 2, SECRET);
      const sig = feedback.slice(feedback.lastIndexOf('.') + 1);
      for (const forged of [`${ID}.${sig}`, `feedback:${ID}:2.${sig}`, `${ID}:2.${sig}`, `${ID}.2.${sig}`]) {
        expect(await verifyUnsubscribeToken(forged, SECRET)).toBeNull();
        expect(await verifyPromoOptOutToken(forged, SECRET)).toBeNull();
        expect(await verifyRatingToken(forged, SECRET)).toBeNull();
      }
    });

    it('pozici lekce ani zápis v tokenu nejde zaměnit', async () => {
      const token = await createFeedbackToken(ID, 2, SECRET);
      const sig = token.slice(token.lastIndexOf('.') + 1);
      expect(await verifyFeedbackToken(`${ID}.3.${sig}`, SECRET)).toBeNull();
      expect(await verifyFeedbackToken(`01HZXK3V5N8Q2R7T9W4YB6C0DF.2.${sig}`, SECRET)).toBeNull();
    });

    it('odmítne nekanonickou pozici a poškozený token', async () => {
      const token = await createFeedbackToken(ID, 2, SECRET);
      const sig = token.slice(token.lastIndexOf('.') + 1);
      for (const position of ['0', '02', '2.0', '1e1', '-2', '', ' 2', '1000', 'x']) {
        expect(await verifyFeedbackToken(`${ID}.${position}.${sig}`, SECRET)).toBeNull();
      }
      expect(await verifyFeedbackToken(token.slice(0, -4), SECRET)).toBeNull();
      expect(await verifyFeedbackToken('', SECRET)).toBeNull();
      expect(await verifyFeedbackToken(`${'a'.repeat(300)}.1.abc`, SECRET)).toBeNull();
      expect(await verifyFeedbackToken(await createFeedbackToken(ID, 2, 'jiny-klic'), SECRET)).toBeNull();
      await expect(createFeedbackToken(ID, 0, SECRET)).rejects.toThrow();
      await expect(createFeedbackToken(ID, 1.5, SECRET)).rejects.toThrow();
    });
  });
});
