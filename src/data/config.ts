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
