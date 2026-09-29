import React from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { canDrawOverlays } from '../../src/native/overlay';
import { ensureNotificationPermission } from '../../src/native/notifications';
import { GameState, useStore } from '../../src/state/store';

type BoolKey = 'widgetEnabled' | 'overlayEnabled' | 'overlayMotion' | 'notificationsEnabled';

export default function SettingsScreen() {
  const store = useStore();
  const router = useRouter();
  const set = (k: BoolKey) => async (v: boolean) => {
    if (k === 'notificationsEnabled' && v && !(await ensureNotificationPermission())) return;
    if (k === 'overlayEnabled' && v && !canDrawOverlays()) {
      router.push('/overlay-permission'); // 권한 안내 → 허용되면 자동으로 켜짐
      return;
    }
    store.update({ [k]: v } as Partial<GameState>);
  };
  const Row = ({ k, label, desc }: { k: BoolKey; label: string; desc: string }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <Switch value={store[k]} onValueChange={set(k)} />
    </View>
  );
  return (
    <ScrollView style={styles.root}>
      <Row k="widgetEnabled" label="위젯 표시" desc="홈 화면 위젯에 새와 편지 수를 보여줘요" />
      {Platform.OS === 'android' && (
        <>
          <Row k="overlayEnabled" label="바탕화면 오버레이" desc="다른 앱 위에 작은 새를 띄워요 (안드로이드 전용)" />
          <Row k="overlayMotion" label="오버레이 움직임" desc="오버레이의 새가 화면 가장자리를 돌아다녀요" />
        </>
      )}
      <Row k="notificationsEnabled" label="알림" desc="새를 숨기거나 앱을 꺼도 편지가 오면 알려줘요" />
      <Text style={styles.note}>위젯/오버레이 기능은 development build에서만 동작해요.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFDF5' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderColor: '#EFE6CC' },
  label: { fontSize: 17, color: '#4A3B2A', fontWeight: '600' },
  desc: { fontSize: 13, color: '#8A7A62', marginTop: 2 },
  note: { margin: 16, color: '#B0A48A', fontSize: 13 },
});
