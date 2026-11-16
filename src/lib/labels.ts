/** Sdílené popisky pro katalog a stránku kurzu. */

export function lessonCountLabel(count: number): string {
  if (count === 1) return '1 lekce';
  if (count >= 2 && count <= 4) return `${count} lekce`;
  return `${count} lekcí`;
}

export function deliveryLabel(mode: string): string {
  return mode === 'next_workday' ? 'každý pracovní den' : 'vlastním tempem';
}

export function priceLabel(czk: number): string {
  return czk === 0 ? 'Zdarma' : `${czk.toLocaleString('cs-CZ')} Kč`;
}

/** Stav zápisu, jak ho vidí student v profilu. */
const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Čeká na potvrzení e-mailu',
  active: 'Aktivní',
  paused: 'Pozastaveno',
  stalled: 'Neaktivní',
  completed: 'Dokončeno',
  cancelled: 'Zrušeno',
};

export function enrollmentStatusLabel(status: string): string {
  return ENROLLMENT_STATUS_LABELS[status] ?? status;
}
