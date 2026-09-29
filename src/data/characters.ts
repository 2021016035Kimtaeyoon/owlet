// 캐릭터 추가는 이 파일만 수정한다.
// 렌더링은 BirdSprite가 담당하므로, 나중에 emoji 대신 image 필드를 추가해 교체할 수 있다.
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Character {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  /** 부화 확률(가중치). 전체 합이 100일 필요는 없다. */
  hatchWeight: number;
}

export const CHARACTERS: Character[] = [
  { id: 'dove', name: '비둘기', emoji: '🕊️', rarity: 'common', hatchWeight: 60 },
  { id: 'sparrow', name: '참새', emoji: '🐦', rarity: 'rare', hatchWeight: 30 },
  { id: 'owl', name: '올빼미', emoji: '🦉', rarity: 'epic', hatchWeight: 9 },
  { id: 'dragon', name: '드래곤', emoji: '🐉', rarity: 'legendary', hatchWeight: 1 },
];

export const STARTER_CHARACTER_ID = 'dove';

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '흔함',
  rare: '레어',
  epic: '에픽',
  legendary: '전설',
};

export const getCharacter = (id: string): Character =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];

/** 가중치 기반 랜덤 부화 */
export function rollHatch(rand: () => number = Math.random): Character {
  const total = CHARACTERS.reduce((s, c) => s + c.hatchWeight, 0);
  let r = rand() * total;
  for (const c of CHARACTERS) {
    if ((r -= c.hatchWeight) < 0) return c;
  }
  return CHARACTERS[0];
}
