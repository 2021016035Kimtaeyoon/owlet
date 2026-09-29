import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { canDrawOverlays, requestOverlayPermission } from '../src/native/overlay';
import { useStore } from '../src/state/store';

// 오버레이 권한 안내 화면. 거부하거나 그냥 닫아도 앱은 정상 동작한다.
export default function OverlayPermissionScreen() {
  const router = useRouter();
  const { update } = useStore();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // 설정 앱에서 허용하고 돌아오면 자동으로 켠다
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && canDrawOverlays()) {
        update({ overlayEnabled: true });
        close();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>🕊️</Text>
      <Text style={styles.title}>다른 앱 위에 표시 권한이 필요해요</Text>
      <Text style={styles.body}>
        새가 다른 앱을 쓰는 동안에도 화면 가장자리를 날아다니고, 편지가 오면 알려주려면 "다른 앱 위에 표시" 권한이 필요해요.{'\n\n'}
        허용하지 않아도 앱의 다른 기능(홈, 편지, 부화, 도감)은 그대로 쓸 수 있어요.
      </Text>
      <Pressable style={styles.primary} onPress={requestOverlayPermission}>
        <Text style={styles.primaryText}>설정에서 허용하기</Text>
      </Pressable>
      <Pressable onPress={close}>
        <Text style={styles.secondary}>나중에 할게요</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F1E1', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  emoji: { fontSize: 72 },
  title: { fontSize: 20, fontWeight: '700', color: '#4A3B2A', textAlign: 'center' },
  body: { fontSize: 15, color: '#6B5D45', lineHeight: 22, textAlign: 'center' },
  primary: { backgroundColor: '#4CAF50', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24, marginTop: 8 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  secondary: { color: '#8A7A62', fontSize: 15, marginTop: 4 },
});
