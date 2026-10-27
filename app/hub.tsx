import { Href, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { REWARDS } from '../src/data/items';
import { rewardInput, useStore } from '../src/state/store';

const ENTRIES: { label: string; emoji: string; href: Href; desc: string }[] = [
  { label: '오늘의 운세', emoji: '🔮', href: '/fortune', desc: '새가 물어오는 운세' },
  { label: '모험', emoji: '🧭', href: '/adventure', desc: '새를 탐험 보내기' },
  { label: '꾸미기', emoji: '🎨', href: '/decorate', desc: '배경·집·소품' },
  { label: '배틀', emoji: '⚔️', href: '/battle', desc: '자동 대결' },
  { label: '랭킹', emoji: '🏆', href: '/ranking', desc: '점수 순위' },
  { label: '리워드', emoji: '🎁', href: '/rewards', desc: '도감·수집 보상' },
  { label: '상점', emoji: '🛍️', href: '/shop', desc: '알·코인' },
  { label: '친구', emoji: '👥', href: '/friends', desc: 'QR·주변 사용자' },
  { label: '부화장치', emoji: '🥚', href: '/incubator', desc: '알 부화' },
];

export default function HubScreen() {
  const router = useRouter();
  const s = useStore();
  const claimable = REWARDS.filter((r) => !s.claimedRewards.includes(r.id) && r.value(rewardInput(s)) >= r.goal).length;
  return (
    <Screen title="더보기">
      <View style={styles.grid}>
        {ENTRIES.map((e) => (
          <Pressable key={e.label} style={styles.card} onPress={() => router.push(e.href)}>
            <Text style={styles.emoji}>{e.emoji}</Text>
            <Text style={styles.name}>{e.label}{e.label === '리워드' && claimable > 0 ? ` 🔴${claimable}` : ''}</Text>
            <Text style={styles.desc}>{e.desc}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: '#FFFDF5', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#EFE6CC' },
  emoji: { fontSize: 40 },
  name: { fontSize: 17, fontWeight: '700', color: '#4A3B2A' },
  desc: { fontSize: 12, color: '#8A7A62' },
});
