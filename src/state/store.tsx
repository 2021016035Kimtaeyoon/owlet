import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { STARTER_CHARACTER_ID } from '../data/characters';

export type BirdMode = 'fly' | 'rest' | 'hidden';

export interface GameState {
  ownedIds: string[];
  mainId: string;
  birdMode: BirdMode;
}

const DEFAULT_STATE: GameState = {
  ownedIds: [STARTER_CHARACTER_ID],
  mainId: STARTER_CHARACTER_ID,
  birdMode: 'fly',
};

const KEY = 'owlet:state:v1';

interface Store extends GameState {
  ready: boolean;
  update: (patch: Partial<GameState>) => void;
}

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

  const value = useMemo(() => ({ ...state, ready, update }), [state, ready, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}
