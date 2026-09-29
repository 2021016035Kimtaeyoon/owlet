import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Character, RARITY_LABEL } from '../src/data/characters';
import { CONFIG } from '../src/data/config';
import { useStore } from '../src/state/store';

export default function IncubatorScreen() {
  const router = useRouter();
  const { eggs, incubatorStartedAt, startIncubation, hatch, ownedIds } = useStore();
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<{ c: Character; isNew: boolean } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const remain = incubatorStartedAt ? Math.max(0, incubatorStartedAt + CONFIG.egg.hatchDurationMs - now) : 0;
  const ready = !!incubatorStartedAt && remain === 0;

  const doHatch = () => {
    const wasOwned = new Set(ownedIds);
    const c = hatch();
    if (c) setResult({ c, isNew: !wasOwned.has(c.id) });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>🥚 부화장치</Text>
      {result ? (
        <>
          <Text style={styles.big}>{result.c.emoji}</Text>
          <Text style={styles.name}>{result.c.name} ({RARITY_LABEL[result.c.rarity]})</Text>
          <Text style={styles.sub}>{result.isNew ? '🎉 새로운 새를 만났어요! 도감에 등록됐어요' : '이미 도감에 있는 새예요'}</Text>
          <Btn label="확인" onPress={() => setResult(null)} />
        </>
      ) : incubatorStartedAt ? (
        <>
          <Text style={styles.big}>{ready ? '🐣' : '🥚'}</Text>
          <Text style={styles.sub}>{ready ? '부화할 준비가 됐어요!' : `남은 시간 ${Math.ceil(remain / 1000)}초`}</Text>
          {ready && <Btn label="부화시키기" onPress={doHatch} />}
        </>
      ) : (
        <>
          <Text style={styles.big}>🪺</Text>
          <Text style={styles.sub}>보유한 알: {eggs}개</Text>
          {eggs > 0 ? <Btn label="알 넣기" onPress={startIncubation} /> : <Text style={styles.sub}>편지를 주고받으면 알을 물어와요</Text>}
        </>
      )}
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
        <Text style={styles.close}>닫기</Text>
      </Pressable>
    </View>
  );
}

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F1E1', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  title: { fontSize: 24, color: '#4A3B2A', fontWeight: '700' },
  big: { fontSize: 96 },
  name: { fontSize: 22, color: '#4A3B2A' },
  sub: { fontSize: 16, color: '#8A7A62', textAlign: 'center' },
  btn: { backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 24 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  close: { marginTop: 20, color: '#8A7A62', fontSize: 16 },
});
