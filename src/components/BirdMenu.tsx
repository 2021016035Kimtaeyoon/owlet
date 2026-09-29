import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface MenuItem { label: string; onPress: () => void }

export function BirdMenu({ visible, items, onClose }: { visible: boolean; items: MenuItem[]; onClose: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          {items.map((it) => (
            <Pressable
              key={it.label}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={() => { onClose(); it.onPress(); }}
            >
              <Text style={styles.label}>{it.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  sheet: { backgroundColor: '#FFFDF5', borderRadius: 16, padding: 8, minWidth: 200 },
  item: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10 },
  pressed: { backgroundColor: '#F0E6C8' },
  label: { fontSize: 18, textAlign: 'center', color: '#4A3B2A' },
});
