import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Character, STARTER_CHARACTER_ID, rollHatch } from '../data/characters';
import { CONFIG } from '../data/config';
import { AppState } from 'react-native';
import { applyOverlay, consumeOverlayOffRequest } from '../native/overlay';
import { syncExternalState } from '../native/externalState';
import { ensureNotificationPermission, scheduleLetterNotification } from '../native/notifications';
import { FRIENDS } from '../data/templates';

export type BirdMode = 'fly' | 'rest' | 'hidden';

export interface Letter {
  id: string;
  direction: 'sent' | 'received';
  friendId: string;
  templateId: string;
  text: string;
  imageUri?: string;
  createdAt: number;
  read: boolean;
  /** 보낸 편지: 답장이 도착할 시각. replied가 true면 이미 도착함 */
  replyDueAt?: number;
  replied?: boolean;
}

export interface GameState {
  widgetEnabled: boolean;
  overlayEnabled: boolean;
  overlayMotion: boolean;
  notificationsEnabled: boolean;
  eggs: number;
  /** 부화장치에 알이 들어간 시각 (없으면 비어 있음) */
  incubatorStartedAt: number | null;
  /** 새가 알을 물어왔다는 안내를 홈에서 보여줄지 */
  eggNotice: boolean;
  letters: Letter[];
  ownedIds: string[];
  mainId: string;
  birdMode: BirdMode;
}

const DEFAULT_STATE: GameState = {
  widgetEnabled: true,
  overlayEnabled: false,
  overlayMotion: true,
  notificationsEnabled: true,
  eggs: 0,
  incubatorStartedAt: null,
  eggNotice: false,
  letters: [],
  ownedIds: [STARTER_CHARACTER_ID],
  mainId: STARTER_CHARACTER_ID,
  birdMode: 'fly',
};

const KEY = 'owlet:state:v1';

interface Store extends GameState {
  ready: boolean;
  update: (patch: Partial<GameState>) => void;
  sendLetter: (input: { friendId: string; templateId: string; text: string; imageUri?: string }) => void;
  markRead: (id: string) => void;
  startIncubation: () => void;
  /** 부화 완료 시 결과 캐릭터를 돌려준다 */
  hatch: () => Character | null;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const rand = (a: number, b: number) => a + Math.random() * (b - a);


const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState({ ...DEFAULT_STATE, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((patch: Partial<GameState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  // 더미 친구의 답장 예약: 앱을 다시 켜도 replyDueAt 기준으로 복구된다
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const deliverReply = useCallback(
    (id: string) => {
      const cur = stateRef.current;
      const src = cur.letters.find((l) => l.id === id);
      if (!src || src.replied) return;
      const friend = FRIENDS.find((f) => f.id === src.friendId) ?? FRIENDS[0];
      const reply: Letter = {
        id: uid(),
        direction: 'received',
        friendId: friend.id,
        templateId: src.templateId,
        text: friend.replies[Math.floor(Math.random() * friend.replies.length)],
        createdAt: Date.now(),
        read: false,
      };
      const dropped = Math.random() < CONFIG.egg.dropChance;
      update({
        letters: [reply, ...cur.letters.map((l) => (l.id === id ? { ...l, replied: true } : l))],
        ...(dropped ? { eggs: cur.eggs + 1, eggNotice: true } : {}),
      });
    },
    [update],
  );
  const schedule = useCallback(
    (l: Letter) => {
      if (l.direction !== 'sent' || l.replied || !l.replyDueAt || timers.current.has(l.id)) return;
      const t = setTimeout(() => {
        timers.current.delete(l.id);
        deliverReply(l.id);
      }, Math.max(0, l.replyDueAt - Date.now()));
      timers.current.set(l.id, t);
    },
    [deliverReply],
  );
  useEffect(() => {
    if (ready) stateRef.current.letters.forEach(schedule);
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, [ready, schedule]);

  const sendLetter: Store['sendLetter'] = useCallback(
    (input) => {
      const l: Letter = {
        ...input,
        id: uid(),
        direction: 'sent',
        createdAt: Date.now(),
        read: true,
        replyDueAt: Date.now() + rand(CONFIG.letter.replyDelayMinMs, CONFIG.letter.replyDelayMaxMs),
      };
      const cur = stateRef.current;
      const dropped = Math.random() < CONFIG.egg.dropChance;
      update({ letters: [l, ...cur.letters], ...(dropped ? { eggs: cur.eggs + 1, eggNotice: true } : {}) });
      schedule(l);
      if (cur.notificationsEnabled && l.replyDueAt) {
        const f = FRIENDS.find((x) => x.id === l.friendId) ?? FRIENDS[0];
        ensureNotificationPermission().then((ok) => { if (ok) scheduleLetterNotification(f.name, l.replyDueAt!); });
      }
    },
    [update, schedule],
  );
  const markRead = useCallback(
    (id: string) =>
      update({ letters: stateRef.current.letters.map((l) => (l.id === id ? { ...l, read: true } : l)) }),
    [update],
  );

  const startIncubation = useCallback(() => {
    const cur = stateRef.current;
    if (cur.eggs < 1 || cur.incubatorStartedAt) return;
    update({ eggs: cur.eggs - 1, incubatorStartedAt: Date.now() });
  }, [update]);
  const hatch = useCallback((): Character | null => {
    const cur = stateRef.current;
    if (!cur.incubatorStartedAt || Date.now() - cur.incubatorStartedAt < CONFIG.egg.hatchDurationMs) return null;
    const c = rollHatch();
    update({
      incubatorStartedAt: null,
      ownedIds: cur.ownedIds.includes(c.id) ? cur.ownedIds : [...cur.ownedIds, c.id],
    });
    return c;
  }, [update]);

  // 앱 밖(위젯/오버레이)과 공유하는 상태는 변경 시 한 곳에서 동기화
  useEffect(() => {
    if (ready) syncExternalState(state);
  }, [ready, state]);

  useEffect(() => {
    if (ready) applyOverlay(state.overlayEnabled);
  }, [ready, state.overlayEnabled]);

  // 오버레이 메뉴에서 끄기를 눌렀다면 앱이 다시 열릴 때 설정에 반영
  useEffect(() => {
    const check = () => {
      if (consumeOverlayOffRequest()) update({ overlayEnabled: false });
    };
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => sub.remove();
  }, [update]);

  const value = useMemo(
    () => ({ ...state, ready, update, sendLetter, markRead, startIncubation, hatch }),
    [state, ready, update, sendLetter, markRead, startIncubation, hatch],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}
