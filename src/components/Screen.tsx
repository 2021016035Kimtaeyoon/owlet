import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';

// 모달 화면 공통 틀: 제목 + 코인 + 닫기
export function Screen({ title, children, scroll = true }: { title: string; children: React.ReactNode; scroll?: boolean }) {
  const router = useRouter();
  const { coins } = useStore();
  const Body = scroll ? ScrollView : View;
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.coins}>🪙 {coins}</Text>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={10}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>
      <Body style={styles.body} {...(scroll ? { contentContainerStyle: styles.content } : {})}>{children}</Body>
    </View>
  );
}

export function Btn({ label, onPress, disabled, tone = 'green' }: { label: string; onPress: () => void; disabled?: boolean; tone?: 'green' | 'gray' | 'gold' }) {
  const bg = tone === 'green' ? '#4CAF50' : tone === 'gold' ? '#F5B700' : '#B9AE93';
  return (
    <Pressable style={[styles.btn, { backgroundColor: bg }, disabled && { opacity: 0.4 }]} onPress={onPress} disabled={disabled}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

export const card = StyleSheet.create({
  box: { backgroundColor: '#FFFDF5', borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: '#EFE6CC' },
  h: { fontSize: 17, fontWeight: '700', color: '#4A3B2A' },
  p: { fontSize: 14, color: '#6B5D45', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F1E1' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: '#4A3B2A' },
  coins: { fontSize: 16, color: '#4A3B2A' },
  close: { fontSize: 22, color: '#8A7A62' },
  body: { flex: 1 },
  content: { padding: 16, gap: 12 },
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 22, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
