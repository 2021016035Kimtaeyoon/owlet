import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Character, STARTER_CHARACTER_ID, rollHatch } from '../data/characters';
import { CONFIG, CONFIG2, FORTUNE_CONFIG } from '../data/config';
import {
  DECOR, DEFAULT_DECOR_EQUIPPED, DEFAULT_DECOR_OWNED, DecorSlot, REWARDS, getLocation, rollCollectible,
} from '../data/items';
import { FORTUNE_FRIEND, FORTUNE_FRIEND_ID, Profile, dateKey, fortuneLetterText, generateFortune } from '../data/fortune';
import { FRIENDS, Friend, NEARBY } from '../data/templates';
import { syncExternalState } from '../native/externalState';
import { cancelDailyFortune, ensureNotificationPermission, scheduleDailyFortune, scheduleLetterNotification, scheduleNotification } from '../native/notifications';
import { applyOverlay, consumeOverlayOffRequest } from '../native/overlay';
import { makeSerial } from '../native/friendCode';

export type BirdMode = 'fly' | 'rest' | 'hidden';
export type GraphicStyle = 'emoji' | 'pixel';

export interface Letter {
  id: string;
  direction: 'sent' | 'received';
  friendId: string;
  templateId: string;
  text: string;
  imageUri?: string;
  videoUri?: string;
  createdAt: number;
  read: boolean;
  /** 보낸 편지: 답장이 도착할 시각. replied가 true면 이미 도착함 */
  replyDueAt?: number;
  replied?: boolean;
}

export interface AdventureResult { locId: string; coins: number; egg: boolean; items: string[] }

export interface GameState {
  widgetEnabled: boolean;
  overlayEnabled: boolean;
  overlayMotion: boolean;
  notificationsEnabled: boolean;
  /** 주변 사용자/모르는 사람에게 편지 보내기 허용 */
  nearbyEnabled: boolean;
  graphicStyle: GraphicStyle;
  eggs: number;
  /** 부화장치에 알이 들어간 시각 (없으면 비어 있음) */
  incubatorStartedAt: number | null;
  /** 새가 알을 물어왔다는 안내를 홈에서 보여줄지 */
  eggNotice: boolean;
  letters: Letter[];
  friends: Friend[];
  serial: string;
  ownedIds: string[];
  mainId: string;
  birdMode: BirdMode;
  coins: number;
  levels: Record<string, number>;
  decorOwned: string[];
  decorEquipped: Record<DecorSlot, string>;
  collection: Record<string, number>;
  adventure: { locId: string; startedAt: number } | null;
  adventureResult: AdventureResult | null;
  battleWins: number;
  battleLosses: number;
  claimedRewards: string[];
  /** 사용자 정보(운세용). 기기 안에만 저장된다 */
  profile: Profile | null;
  fortuneEnabled: boolean;
  lastFortuneDate: string;
}

const DEFAULT_STATE: GameState = {
  widgetEnabled: true,
  overlayEnabled: false,
  overlayMotion: true,
  notificationsEnabled: true,
  nearbyEnabled: false,
  graphicStyle: 'emoji',
  eggs: 0,
  incubatorStartedAt: null,
  eggNotice: false,
  letters: [],
  friends: FRIENDS,
  serial: '',
  ownedIds: [STARTER_CHARACTER_ID],
  mainId: STARTER_CHARACTER_ID,
  birdMode: 'fly',
  coins: CONFIG2.reward.startCoins,
  levels: {},
  decorOwned: DEFAULT_DECOR_OWNED,
  decorEquipped: DEFAULT_DECOR_EQUIPPED,
  collection: {},
  adventure: null,
  adventureResult: null,
  battleWins: 0,
  battleLosses: 0,
  claimedRewards: [],
  profile: null,
  fortuneEnabled: true,
  lastFortuneDate: '',
};

const KEY = 'owlet:state:v1';

interface Store extends GameState {
  ready: boolean;
  update: (patch: Partial<GameState>) => void;
  sendLetter: (input: { friendId: string; templateId: string; text: string; imageUri?: string; videoUri?: string }) => void;
  markRead: (id: string) => void;
  startIncubation: () => void;
  /** 부화 완료 시 결과 캐릭터를 돌려준다 */
  hatch: () => Character | null;
  /** 코인 사용. 부족하면 false */
  spendCoins: (n: number) => boolean;
  addCoins: (n: number) => void;
  buyDecor: (id: string) => boolean;
  equipDecor: (id: string) => void;
  addFriend: (f: Friend) => void;
  feed: (charId: string) => boolean;
  startAdventure: (locId: string) => void;
  /** 모험이 끝났으면 결과를 정산해서 돌려준다 */
  claimAdventure: () => AdventureResult | null;
  recordBattle: (win: boolean) => void;
  claimReward: (id: string) => void;
  /** 부화 타이머를 즉시 완료 상태로 */
  finishIncubation: () => void;
  /** 오늘의 운세 편지를 (아직 안 왔다면) 받는다 */
  deliverTodayFortune: () => void;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));

export const findFriend = (friends: Friend[], id: string): Friend =>
  (id === FORTUNE_FRIEND_ID ? FORTUNE_FRIEND : undefined) ?? friends.find((f) => f.id === id) ?? NEARBY.find((f) => f.id === id) ?? friends[0] ?? FRIENDS[0];

export const unreadCount = (letters: Letter[]) => letters.filter((l) => l.direction === 'received' && !l.read).length;

export function rewardInput(s: GameState) {
  return {
    ownedCount: s.ownedIds.length,
    totalChars: 4,
    lettersSent: s.letters.filter((l) => l.direction === 'sent').length,
    battleWins: s.battleWins,
    collectedKinds: Object.keys(s.collection).length,
    friends: s.friends.length,
  };
}

export const playerScore = (s: GameState) =>
  s.ownedIds.length * 100 + Object.keys(s.collection).length * 20 + s.battleWins * 50 +
  s.letters.filter((l) => l.direction === 'sent').length * 5 +
  Object.values(s.levels).reduce((a, b) => a + (b - 1) * 10, 0);

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const update = useCallback((patch: Partial<GameState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const loaded: GameState = { ...DEFAULT_STATE, ...(raw ? JSON.parse(raw) : {}) };
        if (!loaded.serial) loaded.serial = makeSerial(loaded.mainId); // 목걸이 일련번호(친구 추가용)
        stateRef.current = loaded;
        setState(loaded);
        if (!raw || !JSON.parse(raw).serial) AsyncStorage.setItem(KEY, JSON.stringify(loaded)).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // 더미 친구의 답장 예약: 앱을 다시 켜도 replyDueAt 기준으로 복구된다
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const deliverReply = useCallback(
    (id: string) => {
      const cur = stateRef.current;
      const src = cur.letters.find((l) => l.id === id);
      if (!src || src.replied) return;
      const friend = findFriend(cur.friends, src.friendId);
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
        coins: cur.coins + CONFIG2.reward.letterCoins,
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

  const notifyAt = useCallback((title: string, body: string, at: number) => {
    if (!stateRef.current.notificationsEnabled) return;
    ensureNotificationPermission().then((ok) => { if (ok) scheduleNotification(title, body, at); });
  }, []);

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
      update({
        letters: [l, ...cur.letters],
        coins: cur.coins + CONFIG2.reward.letterCoins,
        ...(dropped ? { eggs: cur.eggs + 1, eggNotice: true } : {}),
      });
      schedule(l);
      if (cur.notificationsEnabled && l.replyDueAt) {
        const f = findFriend(cur.friends, l.friendId);
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
    notifyAt('알이 부화했어요 🐣', '부화장치를 확인해보세요', Date.now() + CONFIG.egg.hatchDurationMs);
  }, [update, notifyAt]);
  const hatch = useCallback((): Character | null => {
    const cur = stateRef.current;
    if (!cur.incubatorStartedAt || Date.now() - cur.incubatorStartedAt < CONFIG.egg.hatchDurationMs) return null;
    const c = rollHatch();
    update({
      incubatorStartedAt: null,
      ownedIds: cur.ownedIds.includes(c.id) ? cur.ownedIds : [...cur.ownedIds, c.id],
      // 이미 가진 새가 나오면 코인으로 보상
      ...(cur.ownedIds.includes(c.id) ? { coins: cur.coins + 15 } : {}),
    });
    return c;
  }, [update]);
  const finishIncubation = useCallback(() => {
    if (stateRef.current.incubatorStartedAt) update({ incubatorStartedAt: Date.now() - CONFIG.egg.hatchDurationMs });
  }, [update]);

  const addCoins = useCallback((n: number) => update({ coins: stateRef.current.coins + n }), [update]);
  const spendCoins = useCallback(
    (n: number) => {
      if (stateRef.current.coins < n) return false;
      update({ coins: stateRef.current.coins - n });
      return true;
    },
    [update],
  );

  const buyDecor = useCallback(
    (id: string) => {
      const cur = stateRef.current;
      const item = DECOR.find((d) => d.id === id);
      if (!item || cur.decorOwned.includes(id) || cur.coins < item.price) return false;
      update({ coins: cur.coins - item.price, decorOwned: [...cur.decorOwned, id] });
      return true;
    },
    [update],
  );
  const equipDecor = useCallback(
    (id: string) => {
      const cur = stateRef.current;
      const item = DECOR.find((d) => d.id === id);
      if (!item || !cur.decorOwned.includes(id)) return;
      update({ decorEquipped: { ...cur.decorEquipped, [item.slot]: id } });
    },
    [update],
  );

  const addFriend = useCallback(
    (f: Friend) => {
      const cur = stateRef.current;
      if (cur.friends.some((x) => x.id === f.id)) return;
      update({ friends: [...cur.friends, f] });
    },
    [update],
  );

  const feed = useCallback(
    (charId: string) => {
      const cur = stateRef.current;
      const lv = cur.levels[charId] ?? 1;
      if (lv >= CONFIG2.battle.maxLevel || cur.coins < CONFIG2.battle.feedCost) return false;
      update({ coins: cur.coins - CONFIG2.battle.feedCost, levels: { ...cur.levels, [charId]: lv + 1 } });
      return true;
    },
    [update],
  );

  const startAdventure = useCallback(
    (locId: string) => {
      const cur = stateRef.current;
      if (cur.adventure || cur.adventureResult) return;
      const loc = getLocation(locId);
      const dur = loc.durationMs * CONFIG2.adventure.durationScale;
      update({ adventure: { locId, startedAt: Date.now() } });
      notifyAt('모험에서 돌아왔어요 🧭', `${loc.name}에서 무언가 찾아왔어요!`, Date.now() + dur);
    },
    [update, notifyAt],
  );
  const claimAdventure = useCallback((): AdventureResult | null => {
    const cur = stateRef.current;
    if (!cur.adventure) return null;
    const loc = getLocation(cur.adventure.locId);
    if (Date.now() - cur.adventure.startedAt < loc.durationMs * CONFIG2.adventure.durationScale) return null;
    const items: string[] = [];
    const n = randInt(loc.itemCount[0], loc.itemCount[1]);
    for (let i = 0; i < n; i++) items.push(rollCollectible().id);
    const result: AdventureResult = {
      locId: loc.id, coins: randInt(loc.coins[0], loc.coins[1]), egg: Math.random() < loc.eggChance, items,
    };
    const collection = { ...cur.collection };
    items.forEach((id) => (collection[id] = (collection[id] ?? 0) + 1));
    update({
      adventure: null,
      coins: cur.coins + result.coins,
      eggs: cur.eggs + (result.egg ? 1 : 0),
      collection,
    });
    return result;
  }, [update]);

  const recordBattle = useCallback(
    (win: boolean) => {
      const cur = stateRef.current;
      update({
        battleWins: cur.battleWins + (win ? 1 : 0),
        battleLosses: cur.battleLosses + (win ? 0 : 1),
        coins: cur.coins + (win ? CONFIG2.battle.winCoins : CONFIG2.battle.loseCoins),
      });
    },
    [update],
  );

  const claimReward = useCallback(
    (id: string) => {
      const cur = stateRef.current;
      const def = REWARDS.find((r) => r.id === id);
      if (!def || cur.claimedRewards.includes(id) || def.value(rewardInput(cur)) < def.goal) return;
      update({
        claimedRewards: [...cur.claimedRewards, id],
        coins: cur.coins + def.coins,
        eggs: cur.eggs + def.eggs,
      });
    },
    [update],
  );

  // 매일 운세: 사용자 정보가 있으면 하루 한 번 새가 운세 편지를 물어온다
  const deliverTodayFortune = useCallback(() => {
    const cur = stateRef.current;
    const today = dateKey();
    if (!cur.profile || !cur.fortuneEnabled || cur.lastFortuneDate === today) return;
    const f = generateFortune(cur.profile);
    const letter: Letter = {
      id: uid(),
      direction: 'received',
      friendId: FORTUNE_FRIEND_ID,
      templateId: f.score >= 4 ? 'flower' : f.score <= 2 ? 'night' : 'plain',
      text: fortuneLetterText(cur.profile, f),
      createdAt: Date.now(),
      read: false,
    };
    update({ letters: [letter, ...cur.letters], lastFortuneDate: today });
  }, [update]);
  useEffect(() => {
    if (!ready) return;
    deliverTodayFortune();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && deliverTodayFortune());
    return () => sub.remove();
  }, [ready, deliverTodayFortune, state.profile, state.fortuneEnabled]);
  useEffect(() => {
    if (!ready) return;
    if (state.profile && state.fortuneEnabled && state.notificationsEnabled) {
      ensureNotificationPermission().then((ok) => { if (ok) scheduleDailyFortune(FORTUNE_CONFIG.notifyHour); });
    } else {
      cancelDailyFortune();
    }
  }, [ready, state.profile, state.fortuneEnabled, state.notificationsEnabled]);

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
    () => ({
      ...state, ready, update, sendLetter, markRead, startIncubation, hatch, spendCoins, addCoins, buyDecor,
      equipDecor, addFriend, feed, startAdventure, claimAdventure, recordBattle, claimReward, finishIncubation, deliverTodayFortune,
    }),
    [
      state, ready, update, sendLetter, markRead, startIncubation, hatch, spendCoins, addCoins, buyDecor,
      equipDecor, addFriend, feed, startAdventure, claimAdventure, recordBattle, claimReward, finishIncubation, deliverTodayFortune,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}
