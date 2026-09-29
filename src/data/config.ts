// 조정값 모음: 확률, 타이머, 지연 시간 등은 여기만 수정한다.
export const CONFIG = {
  // 새 이동 (홈 화면)
  wander: {
    minDurationMs: 3500, // 한 번 날아가는 최소 시간 (느릴수록 천천히)
    maxDurationMs: 7000,
    pauseMinMs: 300, // 도착 후 멈춰 있는 시간
    pauseMaxMs: 1200,
    birdSize: 64,
  },
  // 2단계: 편지
  letter: {
    replyDelayMinMs: 10_000,
    replyDelayMaxMs: 30_000,
    maxLength: 300,
  },
  // 3단계: 알 / 부화
  egg: {
    dropChance: 0.3, // 편지 주고받을 때 알을 물어올 확률
    hatchDurationMs: 60_000, // 테스트용 1분
  },
} as const;

// 확장 기능 조정값
export const CONFIG2 = {
  reward: { letterCoins: 5, startCoins: 50 },
  adventure: { durationScale: 1 }, // 1이면 items.ts의 시간 그대로 (테스트용 짧은 시간). 늘리려면 값을 키운다
  battle: { winCoins: 30, loseCoins: 5, feedCost: 20, maxLevel: 10 },
  shop: { eggPrice: 60, instantHatchPrice: 40, adCoins: 30, coinPackCoins: 200 },
  ad: { countdownSec: 5 },
} as const;
