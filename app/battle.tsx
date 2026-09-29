import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BirdSprite } from '../src/components/BirdSprite';
import { Btn, Screen, card } from '../src/components/Screen';
import { getCharacter } from '../src/data/characters';
import { CONFIG2 } from '../src/data/config';
import { BattleTurn, RIVALS, Rival, simulateBattle, statsOf } from '../src/data/items';
import { useStore } from '../src/state/store';

export default function BattleScreen() {
  const { mainId, levels, recordBattle, battleWins, battleLosses } = useStore();
  const myLv = levels[mainId] ?? 1;
  const me = statsOf(mainId, myLv);
  const [foe, setFoe] = useState<Rival | null>(null);
  const [turns, setTurns] = useState<BattleTurn[]>([]);
  const [shown, setShown] = useState(0);
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = (r: Rival) => {
    const res = simulateBattle(me, statsOf(r.charId, r.level));
    setFoe(r); setTurns(res.turns); setShown(0); setOutcome(null);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= res.turns.length) {
        timer.current && clearInterval(timer.current);
        setOutcome(res.win);
        recordBattle(res.win);
      }
    }, 600);
  };
  useEffect(() => () => { timer.current && clearInterval(timer.current); }, []);

  const foeStats = foe ? statsOf(foe.charId, foe.level) : null;
  const last = shown > 0 ? turns[shown - 1] : null;
  const myHp = last ? last.myHp : me.hp;
  const foeHp = last && foeStats ? last.foeHp : foeStats?.hp ?? 0;
  const fighting = !!foe && outcome === null;

  return (
    <Screen title="배틀">
      <Text style={card.p}>대표 새 Lv.{myLv} · HP {me.hp} · 공격 {me.atk} · {battleWins}승 {battleLosses}패 (육성은 도감에서 먹이를 줘요)</Text>
      {foe && foeStats ? (
        <View style={card.box}>
          <View style={styles.arena}>
            <Fighter name="나" emoji={mainId} hp={myHp} max={me.hp} />
            <Text style={{ fontSize: 28 }}>⚔️</Text>
            <Fighter name={foe.name} emoji={foe.charId} hp={foeHp} max={foeStats.hp} />
          </View>
          {last && <Text style={[card.p, { textAlign: 'center' }]}>{last.attacker === 'me' ? '내 새의 공격!' : '상대의 공격!'} -{last.damage}</Text>}
          {outcome !== null && (
            <Text style={[card.h, { textAlign: 'center' }]}>
              {outcome ? `🎉 승리! 🪙 +${CONFIG2.battle.winCoins}` : `😢 패배… 🪙 +${CONFIG2.battle.loseCoins}`}
            </Text>
          )}
        </View>
      ) : null}
      {RIVALS.map((r) => (
        <View key={r.id} style={[card.box, card.row]}>
          <Text style={{ fontSize: 32 }}>{getCharacter(r.charId).emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={card.h}>{r.name}</Text>
            <Text style={card.p}>Lv.{r.level}</Text>
          </View>
          <Btn label="도전" disabled={fighting} onPress={() => start(r)} />
        </View>
      ))}
    </Screen>
  );
}

function Fighter({ name, emoji, hp, max }: { name: string; emoji: string; hp: number; max: number }) {
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 4 }}>
      <BirdSprite character={getCharacter(emoji)} size={48} />
      <Text style={card.p}>{name}</Text>
      <View style={styles.bar}><View style={[styles.fill, { width: `${(hp / max) * 100}%` }]} /></View>
      <Text style={card.p}>{hp}/{max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: { flexDirection: 'row', alignItems: 'center' },
  bar: { width: '90%', height: 8, borderRadius: 4, backgroundColor: '#E8DFC4', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#E5484D' },
});
