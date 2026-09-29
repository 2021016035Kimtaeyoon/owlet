import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CONFIG2 } from '../data/config';
import { registerAdHost } from '../native/ads';

// 모의 보상형 광고: 카운트다운이 끝나야 보상이 지급된다. 실제 광고 SDK로 교체 시 native/ads.ts만 바꾸면 된다.
export function AdHost() {
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const resolver = useRef<((watched: boolean) => void) | null>(null);

  useEffect(() => {
    registerAdHost((resolve) => {
      resolver.current = resolve;
      setLeft(CONFIG2.ad.countdownSec);
      setOpen(true);
    });
    return () => registerAdHost(null);
  }, []);

  useEffect(() => {
    if (!open || left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [open, left]);

  const close = (watched: boolean) => {
    setOpen(false);
    resolver.current?.(watched);
    resolver.current = null;
  };

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => close(false)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.tag}>광고 (모의)</Text>
          <Text style={styles.big}>📺</Text>
          <Text style={styles.text}>실제 광고가 들어갈 자리예요</Text>
          {left > 0 ? (
            <Text style={styles.count}>{left}초 후 보상을 받을 수 있어요</Text>
          ) : (
            <Pressable style={styles.btn} onPress={() => close(true)}>
              <Text style={styles.btnText}>보상 받기</Text>
            </Pressable>
          )}
          <Pressable onPress={() => close(false)}>
            <Text style={styles.skip}>닫기 (보상 없음)</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFFDF5', borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, width: '100%', maxWidth: 340 },
  tag: { color: '#8A7A62', fontSize: 12 },
  big: { fontSize: 64 },
  text: { color: '#4A3B2A', fontSize: 15 },
  count: { color: '#8A7A62', fontSize: 15, marginVertical: 8 },
  btn: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 22, marginVertical: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skip: { color: '#8A7A62', marginTop: 4 },
});
