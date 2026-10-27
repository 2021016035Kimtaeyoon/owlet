// 오늘의 운세. 서버 없이 (생년월일 + 날짜)로 결정되는 재미용 운세라서 같은 날엔 항상 같은 결과가 나온다.
// 문장/항목 추가는 이 파일만 수정한다.
export interface Profile { name: string; birthDate: string } // birthDate: YYYY-MM-DD

export interface Fortune {
  date: string;
  score: number; // 1~5
  sign: string; // 별자리
  animal: string; // 띠
  summary: string;
  love: string;
  money: string;
  work: string;
  luckyColor: string;
  luckyNumber: number;
  /** 위젯에 한 줄로 보여줄 문구 */
  short: string;
}

export const FORTUNE_FRIEND_ID = 'fortune';
export const FORTUNE_FRIEND = { id: FORTUNE_FRIEND_ID, name: '운세 새', emoji: '🔮', replies: [] as string[] };

export const dateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function parseBirthDate(input: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  if (y < 1900 || dt.getTime() > Date.now()) return null;
  return dt;
}

const SIGNS: [number, number, string][] = [
  [1, 20, '염소자리'], [2, 19, '물병자리'], [3, 21, '물고기자리'], [4, 20, '양자리'], [5, 21, '황소자리'],
  [6, 22, '쌍둥이자리'], [7, 23, '게자리'], [8, 23, '사자자리'], [9, 24, '처녀자리'], [10, 24, '천칭자리'],
  [11, 23, '전갈자리'], [12, 22, '사수자리'],
];
export function zodiacSign(month: number, day: number): string {
  for (const [m, d, name] of SIGNS) if (month < m || (month === m && day < d)) return name;
  return '염소자리';
}
const ANIMALS = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'];
export const chineseAnimal = (year: number) => ANIMALS[year % 12];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SUMMARY: string[][] = [
  ['오늘은 천천히 쉬어가는 게 좋아요. 무리하지 마세요.', '작은 실수에 마음 쓰지 마세요. 금방 지나가요.'],
  ['조금 느리지만 차분히 하면 풀리는 하루예요.', '서두르지 않으면 좋은 소식이 따라와요.'],
  ['무난하고 평온한 하루예요. 평소처럼 하면 충분해요.', '작은 즐거움을 하나 찾아보세요.'],
  ['기분 좋은 일이 생길 것 같아요. 먼저 인사해보세요.', '하던 일에 탄력이 붙는 날이에요.'],
  ['오늘은 운이 아주 좋아요! 망설이던 일을 시작해보세요.', '뜻밖의 좋은 소식이 새를 타고 날아와요.'],
];
const LOVE = ['따뜻한 말 한마디가 큰 힘이 돼요.', '가까운 사람과 짧은 안부를 나눠보세요.', '편지를 쓰기 좋은 날이에요.', '솔직한 마음을 표현하면 좋아요.'];
const MONEY = ['작은 지출은 한 번 더 생각해보세요.', '뜻밖의 절약 기회가 있어요.', '필요한 것에만 쓰면 알찬 하루예요.', '모아둔 것이 빛을 볼 조짐이 있어요.'];
const WORK = ['한 가지에 집중하면 성과가 나요.', '동료의 도움이 힘이 될 거예요.', '미뤄둔 일을 하나만 끝내보세요.', '새로운 아이디어가 번뜩일 수 있어요.'];
const COLORS = ['하늘색', '연두색', '노란색', '분홍색', '하얀색', '보라색', '주황색', '민트색'];

export function generateFortune(profile: Profile, date: Date = new Date()): Fortune {
  const key = dateKey(date);
  const birth = parseBirthDate(profile.birthDate) ?? new Date(2000, 0, 1);
  const r = rng(hash(`${profile.birthDate}|${key}`));
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  const score = 1 + Math.floor(r() * 5);
  const summary = pick(SUMMARY[score - 1]);
  return {
    date: key,
    score,
    sign: zodiacSign(birth.getMonth() + 1, birth.getDate()),
    animal: chineseAnimal(birth.getFullYear()),
    summary,
    love: pick(LOVE),
    money: pick(MONEY),
    work: pick(WORK),
    luckyColor: pick(COLORS),
    luckyNumber: 1 + Math.floor(r() * 45),
    short: `${'★'.repeat(score)}${'☆'.repeat(5 - score)} ${summary}`,
  };
}

export function fortuneLetterText(profile: Profile, f: Fortune): string {
  return [
    `${profile.name}님, 오늘의 운세를 물어왔어요! 🔮`,
    `(${f.sign} · ${f.animal}띠)`,
    '',
    `총운 ${'★'.repeat(f.score)}${'☆'.repeat(5 - f.score)}`,
    f.summary,
    '',
    `💕 애정: ${f.love}`,
    `💰 금전: ${f.money}`,
    `💼 일: ${f.work}`,
    '',
    `행운의 색 ${f.luckyColor} · 행운의 숫자 ${f.luckyNumber}`,
    '',
    '※ 재미로 보는 운세예요.',
  ].join('\n');
}

/** 위젯용: 오늘부터 n일치 한 줄 운세 (앱을 열지 않아도 날짜에 맞게 보이도록 미리 계산) */
export function upcomingShortFortunes(profile: Profile, days = 7): { date: string; text: string }[] {
  const out: { date: string; text: string }[] = [];
  const base = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({ date: dateKey(d), text: generateFortune(profile, d).short });
  }
  return out;
}
