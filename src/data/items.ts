// 꾸미기 · 모험 · 수집품 · 리워드 · 배틀 상대 · 랭킹 더미. 항목 추가는 이 파일만 수정한다.
import { Character, getCharacter } from './characters';

// ---------- 꾸미기 ----------
export type DecorSlot = 'background' | 'nest' | 'accessory';
export interface DecorItem { id: string; slot: DecorSlot; name: string; emoji: string; price: number }

export const DECOR: DecorItem[] = [
  { id: 'bg-day', slot: 'background', name: '맑은 낮', emoji: '☀️', price: 0 },
  { id: 'bg-sunset', slot: 'background', name: '노을', emoji: '🌇', price: 80 },
  { id: 'bg-night', slot: 'background', name: '별밤', emoji: '🌙', price: 120 },
  { id: 'bg-snow', slot: 'background', name: '눈 내리는 날', emoji: '❄️', price: 150 },
  { id: 'nest-basic', slot: 'nest', name: '둥지', emoji: '🪹', price: 0 },
  { id: 'nest-hut', slot: 'nest', name: '오두막', emoji: '🛖', price: 100 },
  { id: 'nest-house', slot: 'nest', name: '나무 집', emoji: '🏡', price: 200 },
  { id: 'acc-none', slot: 'accessory', name: '없음', emoji: '➖', price: 0 },
  { id: 'acc-ribbon', slot: 'accessory', name: '리본', emoji: '🎀', price: 40 },
  { id: 'acc-glasses', slot: 'accessory', name: '선글라스', emoji: '🕶️', price: 60 },
  { id: 'acc-hat', slot: 'accessory', name: '모자', emoji: '🎩', price: 80 },
  { id: 'acc-crown', slot: 'accessory', name: '왕관', emoji: '👑', price: 150 },
];
export const getDecor = (id: string) => DECOR.find((d) => d.id === id);
export const DEFAULT_DECOR_OWNED = ['bg-day', 'nest-basic', 'acc-none'];
export const DEFAULT_DECOR_EQUIPPED: Record<DecorSlot, string> = {
  background: 'bg-day', nest: 'nest-basic', accessory: 'acc-none',
};

export interface SceneTheme { sky: string; sky2: string; grass: string; sun: string; leaves: string; snow?: boolean }
export const THEMES: Record<string, SceneTheme> = {
  'bg-day': { sky: '#9BD7F5', sky2: '#C8ECFB', grass: '#6BBF59', sun: '☀️', leaves: '#4CAF50' },
  'bg-sunset': { sky: '#F6A56B', sky2: '#FBD3A0', grass: '#7A9E4E', sun: '🌇', leaves: '#5E8C3A' },
  'bg-night': { sky: '#1C2541', sky2: '#2B3A67', grass: '#2F5D3A', sun: '🌙', leaves: '#2E6B3A' },
  'bg-snow': { sky: '#C9D9E8', sky2: '#E8F0F7', grass: '#F2F6FA', sun: '🌨️', leaves: '#7FA98A', snow: true },
};

// ---------- 수집품 ----------
export interface Collectible { id: string; name: string; emoji: string; weight: number }
export const COLLECTIBLES: Collectible[] = [
  { id: 'acorn', name: '도토리', emoji: '🌰', weight: 30 },
  { id: 'mushroom', name: '버섯', emoji: '🍄', weight: 25 },
  { id: 'shell', name: '조개', emoji: '🐚', weight: 20 },
  { id: 'feather', name: '깃털', emoji: '🪶', weight: 15 },
  { id: 'clover', name: '네잎클로버', emoji: '🍀', weight: 6 },
  { id: 'gem', name: '보석', emoji: '💎', weight: 3 },
  { id: 'orb', name: '신비한 구슬', emoji: '🔮', weight: 1 },
];
export function rollCollectible(rand: () => number = Math.random): Collectible {
  const total = COLLECTIBLES.reduce((s, c) => s + c.weight, 0);
  let r = rand() * total;
  for (const c of COLLECTIBLES) if ((r -= c.weight) < 0) return c;
  return COLLECTIBLES[0];
}

// ---------- 모험 ----------
export interface Location {
  id: string; name: string; emoji: string;
  durationMs: number; // 테스트용 짧은 시간
  coins: [number, number]; eggChance: number; itemCount: [number, number];
}
export const LOCATIONS: Location[] = [
  { id: 'forest', name: '속삭이는 숲', emoji: '🌲', durationMs: 60_000, coins: [10, 25], eggChance: 0.15, itemCount: [1, 2] },
  { id: 'sea', name: '반짝이는 바다', emoji: '🌊', durationMs: 120_000, coins: [20, 45], eggChance: 0.25, itemCount: [1, 3] },
  { id: 'mountain', name: '높은 산봉우리', emoji: '⛰️', durationMs: 180_000, coins: [35, 70], eggChance: 0.35, itemCount: [2, 3] },
];
export const getLocation = (id: string) => LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];

// ---------- 배틀 ----------
export const BASE_STATS: Record<Character['rarity'], { hp: number; atk: number }> = {
  common: { hp: 60, atk: 9 }, rare: { hp: 70, atk: 11 }, epic: { hp: 85, atk: 14 }, legendary: { hp: 110, atk: 19 },
};
export interface Rival { id: string; name: string; charId: string; level: number }
export const RIVALS: Rival[] = [
  { id: 'r1', name: '깃털 초보', charId: 'dove', level: 1 },
  { id: 'r2', name: '나뭇가지 대장', charId: 'sparrow', level: 3 },
  { id: 'r3', name: '밤의 사냥꾼', charId: 'owl', level: 5 },
  { id: 'r4', name: '불꽃의 왕', charId: 'dragon', level: 7 },
];
export function statsOf(charId: string, level: number) {
  const b = BASE_STATS[getCharacter(charId).rarity];
  const m = 1 + 0.12 * (level - 1);
  return { hp: Math.round(b.hp * m), atk: Math.round(b.atk * m) };
}

export interface BattleTurn { attacker: 'me' | 'foe'; damage: number; myHp: number; foeHp: number }
export function simulateBattle(me: { hp: number; atk: number }, foe: { hp: number; atk: number }, rand: () => number = Math.random) {
  let myHp = me.hp, foeHp = foe.hp;
  const turns: BattleTurn[] = [];
  let mine = rand() < 0.5;
  while (myHp > 0 && foeHp > 0 && turns.length < 60) {
    const base = mine ? me.atk : foe.atk;
    const dmg = Math.max(1, Math.round(base * (0.8 + rand() * 0.5)));
    if (mine) foeHp = Math.max(0, foeHp - dmg); else myHp = Math.max(0, myHp - dmg);
    turns.push({ attacker: mine ? 'me' : 'foe', damage: dmg, myHp, foeHp });
    mine = !mine;
  }
  return { turns, win: foeHp <= 0 };
}

// ---------- 랭킹 (서버가 없어서 더미 플레이어) ----------
export const RANK_DUMMIES = [
  { name: '구름지기', score: 1800 }, { name: '포로롱', score: 1200 }, { name: '달빛', score: 900 },
  { name: '토리', score: 620 }, { name: '깃털왕', score: 400 }, { name: '아기새', score: 150 },
];

// ---------- 리워드 ----------
export interface RewardProgressInput {
  ownedCount: number; totalChars: number; lettersSent: number; battleWins: number; collectedKinds: number; friends: number;
}
export interface RewardDef { id: string; label: string; goal: number; value: (s: RewardProgressInput) => number; coins: number; eggs: number }
export const REWARDS: RewardDef[] = [
  { id: 'dex2', label: '새 2종 모으기', goal: 2, value: (s) => s.ownedCount, coins: 50, eggs: 0 },
  { id: 'dex-all', label: '도감 완성', goal: 4, value: (s) => s.ownedCount, coins: 300, eggs: 2 },
  { id: 'letter5', label: '편지 5통 보내기', goal: 5, value: (s) => s.lettersSent, coins: 40, eggs: 1 },
  { id: 'letter20', label: '편지 20통 보내기', goal: 20, value: (s) => s.lettersSent, coins: 120, eggs: 1 },
  { id: 'win3', label: '배틀 3승', goal: 3, value: (s) => s.battleWins, coins: 80, eggs: 0 },
  { id: 'items5', label: '수집품 5종 모으기', goal: 5, value: (s) => s.collectedKinds, coins: 100, eggs: 1 },
  { id: 'friend3', label: '친구 3명 이상', goal: 3, value: (s) => s.friends, coins: 30, eggs: 0 },
];
