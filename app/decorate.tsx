import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Btn, Screen, card } from '../src/components/Screen';
import { DECOR, DecorSlot } from '../src/data/items';
import { useStore } from '../src/state/store';

const SLOTS: { id: DecorSlot; label: string }[] = [
  { id: 'background', label: '배경' },
  { id: 'nest', label: '집' },
  { id: 'accessory', label: '소품' },
];

export default function DecorateScreen() {
  const { decorOwned, decorEquipped, buyDecor, equipDecor, coins } = useStore();
  const [slot, setSlot] = useState<DecorSlot>('background');
  return (
    <Screen title="꾸미기">
      <View style={styles.tabs}>
        {SLOTS.map((s) => (
          <Pressable key={s.id} style={[styles.tab, slot === s.id && styles.tabOn]} onPress={() => setSlot(s.id)}>
            <Text style={[styles.tabText, slot === s.id && { color: '#fff' }]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      {DECOR.filter((d) => d.slot === slot).map((d) => {
        const owned = decorOwned.includes(d.id);
        const on = decorEquipped[d.slot] === d.id;
        return (
          <View key={d.id} style={[card.box, card.row, on && { borderColor: '#F5B700', borderWidth: 2 }]}>
            <Text style={{ fontSize: 34 }}>{d.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={card.h}>{d.name}</Text>
              <Text style={card.p}>{owned ? (on ? '적용 중' : '보유') : `🪙 ${d.price}`}</Text>
            </View>
            {owned ? (
              <Btn label={on ? '적용됨' : '적용'} onPress={() => equipDecor(d.id)} disabled={on} />
            ) : (
              <Btn label="구매" tone="gold" disabled={coins < d.price} onPress={() => { if (buyDecor(d.id)) equipDecor(d.id); }} />
            )}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 18, backgroundColor: '#E8DFC4' },
  tabOn: { backgroundColor: '#4CAF50' },
  tabText: { color: '#4A3B2A', fontSize: 15 },
});
