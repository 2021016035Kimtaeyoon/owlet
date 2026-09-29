import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Btn, Screen, card } from '../src/components/Screen';
import { getCharacter } from '../src/data/characters';
import { CONFIG2 } from '../src/data/config';
import { COLLECTIBLES, LOCATIONS, getLocation } from '../src/data/items';
import { AdventureResult, useStore } from '../src/state/store';

export default function AdventureScreen() {
  const { adventure, startAdventure, claimAdventure, mainId } = useStore();
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<AdventureResult | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const loc = adventure ? getLocation(adventure.locId) : null;
  const remain = adventure && loc ? Math.max(0, adventure.startedAt + loc.durationMs * CONFIG2.adventure.durationScale - now) : 0;
  const bird = getCharacter(mainId);

  if (result) {
    const l = getLocation(result.locId);
    return (
      <Screen title="모험 결과">
        <View style={[card.box, { alignItems: 'center' }]}>
          <Text style={{ fontSize: 60 }}>{bird.emoji}</Text>
          <Text style={card.h}>{l.emoji} {l.name}에서 돌아왔어요!</Text>
          <Text style={card.p}>🪙 코인 +{result.coins}</Text>
          {result.egg && <Text style={card.p}>🥚 알을 주워왔어요!</Text>}
          <Text style={card.p}>
            수집품: {result.items.map((id) => COLLECTIBLES.find((c) => c.id === id)?.emoji).join(' ')}
          </Text>
        </View>
        <Btn label="확인" onPress={() => setResult(null)} />
      </Screen>
    );
  }

  return (
    <Screen title="모험">
      {adventure && loc ? (
        <View style={[card.box, { alignItems: 'center' }]}>
          <Text style={{ fontSize: 56 }}>{loc.emoji}</Text>
          <Text style={card.h}>{bird.name}이(가) {loc.name}을(를) 탐험 중</Text>
          {remain > 0 ? (
            <Text style={card.p}>남은 시간 {Math.ceil(remain / 1000)}초 (앱을 꺼도 알림으로 알려줘요)</Text>
          ) : (
            <Btn label="돌아온 새 맞이하기" onPress={() => setResult(claimAdventure())} />
          )}
        </View>
      ) : (
        LOCATIONS.map((l) => (
          <View key={l.id} style={card.box}>
            <Text style={card.h}>{l.emoji} {l.name}</Text>
            <Text style={card.p}>
              탐험 {Math.round(l.durationMs / 1000)}초 · 코인 {l.coins[0]}~{l.coins[1]} · 알 {Math.round(l.eggChance * 100)}%
            </Text>
            <Btn label="보내기" onPress={() => startAdventure(l.id)} />
          </View>
        ))
      )}
      <Text style={styles.note}>모험 중에는 홈에서 새가 사라지고, 위젯/오버레이에서도 숨김으로 표시돼요.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ note: { color: '#8A7A62', fontSize: 12, textAlign: 'center' } });
