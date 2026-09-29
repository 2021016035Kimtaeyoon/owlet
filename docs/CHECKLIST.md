# 실기기 확인 체크리스트 (한 번에)

## 준비
- [ ] `npm install --legacy-peer-deps`
- [ ] Android: `npx expo prebuild && npx expo run:android` / iOS(Mac): `npx expo prebuild -p ios` 후 `app.json`의 `expo.ios.appleTeamId` 설정 → `npx expo run:ios`
- [ ] 빌드 오류가 나면 메시지를 그대로 전달 (Kotlin/Swift는 이 환경에서 컴파일하지 못했음)

## 1단계 홈
- [ ] 새가 천천히 랜덤 이동, 드래그 후 놓으면 다시 이동
- [ ] 길게 누르면 메뉴(숨기기/쉬기/부화장치/도감), 짧은 탭엔 메뉴 없음
- [ ] 숨기기 → "새 부르기", 쉬기 → 둥지 이동 후 정지 → 탭하면 재개, 재시작 후 상태 유지

## 2단계 편지
- [ ] 편지지 3종 위에서 글쓰기, 사진 1장 첨부(권한 팝업), 보내기 애니메이션
- [ ] 10~30초 뒤 답장 → 홈 새가 ✉️ → 탭하면 양식 그대로 열림 → 읽으면 ✉️ 사라짐
- [ ] 편지함에 받은/보낸 편지, 안 읽음 🔴

## 3단계 부화/도감
- [ ] 편지 주고받을 때 ~30% 알 (`CONFIG.egg.dropChance`=1로 임시 확인 가능)
- [ ] 알 넣기 → 1분 → 부화, 재시작해도 타이머 유지, 도감 컬러/실루엣, 대표 변경 시 홈 반영

## 4단계 앱 밖 연동
- [ ] 편지 전송 후 앱 종료 → 알림 도착, 알림 탭 시 편지 있으면 편지함/없으면 홈
- [ ] `adb shell am start -a android.intent.action.VIEW -d owlet://open` (iOS: `xcrun simctl openurl booted owlet://open`)
- [ ] 설정 스위치 4종 동작 (오버레이는 Android에서만 보임)

## 5단계 Android 오버레이
- [ ] 켜면 권한 안내 → 허용 후 복귀 시 자동으로 새 표시, 거부해도 앱 정상
- [ ] 다른 앱 위에서 가장자리 이동, 드래그, 탭=앱 열기, 길게 누르기 메뉴 3종
- [ ] 숨기기 → 알림 "새 보이기", 오버레이 끄기 → 앱 복귀 시 스위치 꺼짐, 움직임 OFF 시 정지
- [ ] 편지가 오면 ✉️ 표시

## 6단계 Android 위젯 (Kotlin RemoteViews)
- [ ] 홈 화면 위젯 목록에서 "새 메신저" 2x2 추가
- [ ] 대표 캐릭터 + 자연 배경, 안 읽은 편지 수 배지 + ✉️
- [ ] 앱에서 상태가 바뀔 때(편지 도착/읽음, 대표 변경) 위젯 갱신, 갱신마다 새 위치 변경
- [ ] 위젯 표시 OFF → 💤, 새 숨김 → 🙈, 탭하면 앱 열림

## 7단계 iOS 위젯 (Mac)
- [ ] 소형/중형 위젯 추가, 대표 캐릭터 + 배지 + ✉️
- [ ] App Group `group.com.owlet.app`이 개발자 계정에서 앱/위젯 양쪽에 켜져 있는지 (Xcode Signing & Capabilities)
- [ ] 5분 간격으로 포즈 변경(타임라인), 탭 시 앱 열림, 앱에서 상태 변경 시 갱신

## 직접 해야 하는 설정
- Android Studio/SDK/JDK, USB 디버깅 기기, Android 13+ 알림 권한 허용, 제조사 배터리 최적화 해제
- Xcode, Apple 개발자 계정(서명, App Group 등록), `ios.appleTeamId`
- 번들ID/패키지명(`com.owlet.app`)은 임시값 — 정하면 `app.json`, `plugins/withOwletNative.js`, `OwletSharedModule.swift`, `targets/widget/*` 의 App Group ID도 함께 변경
