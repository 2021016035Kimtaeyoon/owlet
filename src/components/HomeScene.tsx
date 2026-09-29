import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface Point { x: number; y: number }

/** 둥지 중심 좌표 (새가 쉬러 가는 곳) */
export const getNestPos = (w: number, h: number): Point => ({ x: w * 0.72, y: h * 0.5 });

// 하늘 / 나무 / 둥지 / 풀밭을 단순한 도형과 이모지로 표현
export function HomeScene({ width, height }: { width: number; height: number }) {
  const nest = getNestPos(width, height);
  const grassTop = height * 0.8;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#9BD7F5' }]} pointerEvents="none">
      <View style={[styles.sky2, { height: height * 0.35 }]} />
      <Text style={[styles.cloud, { top: height * 0.08, left: width * 0.1 }]}>☁️</Text>
      <Text style={[styles.cloud, { top: height * 0.18, left: width * 0.55, fontSize: 40 }]}>☁️</Text>
      <Text style={[styles.sun, { top: height * 0.05, right: 20 }]}>☀️</Text>
      {/* 나무 줄기 + 잎 */}
      <View style={[styles.trunk, { left: nest.x - 18, top: nest.y, height: grassTop - nest.y + 10 }]} />
      <View style={[styles.leaves, { left: nest.x - 90, top: nest.y - 190 }]} />
      <View style={[styles.leaves, { left: nest.x - 40, top: nest.y - 150, width: 150, height: 150, opacity: 0.9 }]} />
      {/* 둥지 */}
      <View style={[styles.nest, { left: nest.x - 40, top: nest.y + 12 }]}>
        <Text style={styles.nestText}>🪹</Text>
      </View>
      {/* 풀밭 */}
      <View style={[styles.grass, { top: grassTop, height: height - grassTop }]} />
      <Text style={[styles.deco, { top: grassTop - 14, left: width * 0.08 }]}>🌷</Text>
      <Text style={[styles.deco, { top: grassTop - 6, left: width * 0.3 }]}>🌼</Text>
      <Text style={[styles.deco, { top: grassTop + 20, left: width * 0.5 }]}>🍄</Text>
      <Text style={[styles.deco, { top: grassTop + 6, left: width * 0.85 }]}>🌿</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sky2: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#C8ECFB', opacity: 0.6 },
  cloud: { position: 'absolute', fontSize: 56, opacity: 0.9 },
  sun: { position: 'absolute', fontSize: 44 },
  trunk: { position: 'absolute', width: 36, backgroundColor: '#8B5A2B', borderRadius: 8 },
  leaves: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#4CAF50' },
  nest: { position: 'absolute', width: 80, height: 50, alignItems: 'center', justifyContent: 'center' },
  nestText: { fontSize: 48 },
  grass: { position: 'absolute', left: 0, right: 0, backgroundColor: '#6BBF59' },
  deco: { position: 'absolute', fontSize: 28 },
});
