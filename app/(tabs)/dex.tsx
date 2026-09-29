import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BirdSprite } from '../../src/components/BirdSprite';
import { CHARACTERS, RARITY_LABEL } from '../../src/data/characters';
import { useStore } from '../../src/state/store';

export default function DexScreen() {
  const { ownedIds, mainId, update } = useStore();
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.count}>수집 {ownedIds.length} / {CHARACTERS.length}</Text>
      <View style={styles.grid}>
        {CHARACTERS.map((c) => {
          const owned = ownedIds.includes(c.id);
          const isMain = c.id === mainId;
          return (
            <Pressable
              key={c.id}
              style={[styles.card, isMain && styles.cardMain]}
              disabled={!owned}
              onPress={() => update({ mainId: c.id, birdMode: 'fly' })}
            >
              <BirdSprite character={c} size={56} silhouette={!owned} />
              <Text style={styles.name}>{owned ? c.name : '???'}</Text>
              <Text style={styles.rarity}>{owned ? RARITY_LABEL[c.rarity] : ' '}</Text>
              <Text style={styles.tag}>{isMain ? '⭐ 대표' : owned ? '대표로 설정' : ' '}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFDF5' },
  content: { padding: 16 },
  count: { fontSize: 16, color: '#8A7A62', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#F6F1E1', borderWidth: 2, borderColor: 'transparent' },
  cardMain: { borderColor: '#F5B700' },
  name: { marginTop: 8, fontSize: 17, color: '#4A3B2A', fontWeight: '600' },
  rarity: { color: '#8A7A62', fontSize: 13 },
  tag: { marginTop: 4, color: '#4CAF50', fontSize: 13 },
});
