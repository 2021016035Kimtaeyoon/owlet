import { CHARACTERS } from '../data/characters';

// 일련번호: OWL-{캐릭터 번호}-{6자리 태그}. QR/공유 링크에는 owlet://add?code=... 형태로 담는다.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeSerial(charId: string): string {
  const idx = Math.max(0, CHARACTERS.findIndex((c) => c.id === charId));
  let tag = '';
  for (let i = 0; i < 6; i++) tag += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `OWL-${idx}-${tag}`;
}

export const toLink = (serial: string) => `owlet://add?code=${serial}`;

/** QR 내용/링크/직접 입력 어느 쪽이든 일련번호만 뽑아 검증한다 */
export function parseSerial(input: string): { serial: string; charId: string; tag: string } | null {
  const m = /OWL-(\d)-([A-Z0-9]{6})/i.exec(input.trim());
  if (!m) return null;
  const c = CHARACTERS[Number(m[1])];
  if (!c) return null;
  const tag = m[2].toUpperCase();
  return { serial: `OWL-${m[1]}-${tag}`, charId: c.id, tag };
}
