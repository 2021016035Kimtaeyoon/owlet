import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { STARTER_CHARACTER_ID } from '../data/characters';
import { CONFIG } from '../data/config';
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
  letters: Letter[];
  ownedIds: string[];
  mainId: string;
  birdMode: BirdMode;
}

const DEFAULT_STATE: GameState = {
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
      update({ letters: [reply, ...cur.letters.map((l) => (l.id === id ? { ...l, replied: true } : l))] });
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
      update({ letters: [l, ...stateRef.current.letters] });
      schedule(l);
    },
    [update, schedule],
  );
  const markRead = useCallback(
    (id: string) =>
      update({ letters: stateRef.current.letters.map((l) => (l.id === id ? { ...l, read: true } : l)) }),
    [update],
  );

  const value = useMemo(
    () => ({ ...state, ready, update, sendLetter, markRead }),
    [state, ready, update, sendLetter, markRead],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}
