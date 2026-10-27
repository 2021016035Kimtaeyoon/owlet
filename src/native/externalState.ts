import { getCharacter } from '../data/characters';
import { upcomingShortFortunes } from '../data/fortune';
import type { GameState } from '../state/store';
import Shared from '../../modules/owlet-shared';

/** 위젯/오버레이가 읽는 공유 상태 스키마 (iOS/Android 공통 JSON) */
export interface ExternalState {
  mainId: string;
  mainEmoji: string;
  unreadCount: number;
  birdMode: 'fly' | 'rest' | 'hidden';
  widgetEnabled: boolean;
  overlayEnabled: boolean;
  overlayMotion: boolean;
  /** 날짜별 한 줄 운세 (프로필이 없으면 빈 배열) */
  fortunes: { date: string; text: string }[];
  updatedAt: number;
}

export function toExternalState(s: GameState): ExternalState {
  return {
    mainId: s.mainId,
    mainEmoji: getCharacter(s.mainId).emoji,
    unreadCount: s.letters.filter((l) => l.direction === 'received' && !l.read).length,
    // 모험 중에는 새가 자리를 비운 상태로 보이게 한다
    birdMode: s.adventure ? 'hidden' : s.birdMode,
    widgetEnabled: s.widgetEnabled,
    overlayEnabled: s.overlayEnabled,
    overlayMotion: s.overlayMotion,
    fortunes: s.profile && s.fortuneEnabled ? upcomingShortFortunes(s.profile) : [],
    updatedAt: Date.now(),
  };
}

let lastJson = '';

/** 공유 저장소에 저장 + 위젯 갱신. 상태가 바뀔 때마다 이 함수 하나로 처리한다. */
export function syncExternalState(state: GameState): void {
  if (!Shared) return;
  try {
    const { updatedAt: _ignore, ...rest } = toExternalState(state);
    const key = JSON.stringify(rest);
    if (key === lastJson) return; // 변화 없으면 갱신 생략(배터리)
    lastJson = key;
    Shared.setState(JSON.stringify({ ...rest, updatedAt: Date.now() }));
    Shared.reloadWidgets();
  } catch (e) {
    console.warn('syncExternalState failed', e);
  }
}
