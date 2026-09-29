# 새 메신저 (프로토타입)

메시지를 전해주는 새를 키우는 앱. Expo(React Native) + TypeScript, 서버 없이 로컬(AsyncStorage) 전용.

## 실행 (1~3단계, Expo Go)
```
npm install --legacy-peer-deps
npx expo start      # QR을 Expo Go로 스캔
```

## 구조
- `src/data/characters.ts` 캐릭터 목록 (추가는 이 파일만)
- `src/data/templates.ts` 편지지 양식 / 더미 친구
- `src/data/config.ts` 확률·타이머·지연 시간 조정값
- `src/state/store.tsx` AsyncStorage 기반 전역 상태
- `src/components/BirdSprite.tsx` 캐릭터 렌더링 (이모지 → 이미지 교체 지점)
- `src/components/FlyingBird.tsx` 날기/드래그/길게 누르기
- `app/(tabs)/*` 하단 탭 화면 (expo-router)

## 진행 상황
- [x] 1단계 홈 화면
- [x] 2단계 편지 · [x] 3단계 부화/도감 · [ ] 4~7단계 앱 밖 연동
