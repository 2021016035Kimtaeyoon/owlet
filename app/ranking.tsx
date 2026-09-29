import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, card } from '../src/components/Screen';
import { RANK_DUMMIES } from '../src/data/items';
import { playerScore, useStore } from '../src/state/store';

export default function RankingScreen() {
  const s = useStore();
  const rows = [...RANK_DUMMIES.map((r) => ({ ...r, me: false })), { name: '나', score: playerScore(s), me: true }].sort(
    (a, b) => b.score - a.score,
  );
  return (
    <Screen title="랭킹">
      <Text style={card.p}>점수 = 새 수집 · 수집품 종류 · 배틀 승리 · 보낸 편지 · 육성 레벨. (서버가 없어서 다른 플레이어는 예시 데이터예요)</Text>
      {rows.map((r, i) => (
        <View key={r.name} style={[card.box, card.row, r.me && { borderColor: '#F5B700', borderWidth: 2 }]}>
          <Text style={styles.rank}>{['🥇', '🥈', '🥉'][i] ?? i + 1}</Text>
          <Text style={[card.h, { flex: 1 }]}>{r.name}</Text>
          <Text style={card.p}>{r.score}점</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ rank: { width: 32, fontSize: 20, textAlign: 'center' } });
