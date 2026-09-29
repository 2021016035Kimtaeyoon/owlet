import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function Placeholder({ title, stage }: { title: string; stage: number }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{stage}단계에서 구현됩니다</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF5' },
  title: { fontSize: 22, color: '#4A3B2A' },
  sub: { marginTop: 8, color: '#8A7A62' },
});
