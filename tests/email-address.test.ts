import { describe, expect, it } from 'vitest';
import { replyAddress } from '@lib/email';

describe('replyAddress', () => {
  it('vytáhne adresu z hlavičky se jménem', () => {
    expect(replyAddress('Škola AI <tereza@skola.aivefirmach.cz>')).toBe('tereza@skola.aivefirmach.cz');
  });

  it('holou adresu vrátí beze změny', () => {
    expect(replyAddress(' tereza@skola.aivefirmach.cz ')).toBe('tereza@skola.aivefirmach.cz');
  });
});
