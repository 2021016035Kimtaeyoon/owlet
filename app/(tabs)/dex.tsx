import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BirdSprite } from '../../src/components/BirdSprite';
import { Btn } from '../../src/components/Screen';
import { CHARACTERS, Character, RARITY_LABEL } from '../../src/data/characters';
import { CONFIG2 } from '../../src/data/config';
import { COLLECTIBLES, statsOf } from '../../src/data/items';
import { useStore } from '../../src/state/store';

export default function DexScreen() {
  const router = useRouter();
  const { ownedIds, mainId, update, levels, coins, feed, collection } = useStore();
  const [tab, setTab] = useState<'birds' | 'items'>('birds');
  const [sel, setSel] = useState<Character | null>(null);
  const lv = sel ? levels[sel.id] ?? 1 : 1;
  const st = sel ? statsOf(sel.id, lv) : null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        {(['birds', 'items'] as const).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t === 'birds' ? '새' : '수집품'}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.rewardBtn} onPress={() => router.push('/rewards')}>
          <Text style={styles.tabText}>🎁 리워드</Text>
        </Pressable>
      </View>

      {tab === 'birds' ? (
        <>
          <Text style={styles.count}>수집 {ownedIds.length} / {CHARACTERS.length}</Text>
          <View style={styles.grid}>
            {CHARACTERS.map((c) => {
              const owned = ownedIds.includes(c.id);
              return (
                <Pressable key={c.id} style={[styles.card, c.id === mainId && styles.cardMain]} disabled={!owned} onPress={() => setSel(c)}>
                  <BirdSprite character={c} size={56} silhouette={!owned} />
                  <Text style={styles.name}>{owned ? c.name : '???'}</Text>
                  <Text style={styles.rarity}>{owned ? `${RARITY_LABEL[c.rarity]} · Lv.${levels[c.id] ?? 1}` : ' '}</Text>
                  <Text style={styles.tag}>{c.id === mainId ? '⭐ 대표' : owned ? '탭해서 자세히' : ' '}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.count}>수집 {Object.keys(collection).length} / {COLLECTIBLES.length} (모험에서 찾을 수 있어요)</Text>
          <View style={styles.grid}>
            {COLLECTIBLES.map((c) => {
              const n = collection[c.id] ?? 0;
              return (
                <View key={c.id} style={styles.card}>
                  <Text style={[styles.itemEmoji, n === 0 && { opacity: 0.25 }]}>{n ? c.emoji : '❔'}</Text>
                  <Text style={styles.name}>{n ? c.name : '???'}</Text>
                  <Text style={styles.rarity}>{n ? `x${n}` : ' '}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <Modal transparent visible={!!sel} animationType="fade" onRequestClose={() => setSel(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSel(null)}>
          {sel && st && (
            <Pressable style={styles.sheet}>
              <BirdSprite character={sel} size={72} />
              <Text style={styles.name}>{sel.name} · Lv.{lv}</Text>
              <Text style={styles.rarity}>{RARITY_LABEL[sel.rarity]} · HP {st.hp} · 공격 {st.atk}</Text>
              <Btn label={`🍎 먹이 주기 (🪙 ${CONFIG2.battle.feedCost})`} tone="gold" disabled={coins < CONFIG2.battle.feedCost || lv >= CONFIG2.battle.maxLevel} onPress={() => feed(sel.id)} />
              <Btn label={sel.id === mainId ? '대표 캐릭터' : '대표로 설정'} disabled={sel.id === mainId} onPress={() => { update({ mainId: sel.id, birdMode: 'fly' }); setSel(null); }} />
              <Text style={styles.rarity}>보유 코인 {coins}</Text>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFDF5' },
  content: { padding: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 18, backgroundColor: '#E8DFC4' },
  tabOn: { backgroundColor: '#4CAF50' },
  tabText: { color: '#4A3B2A', fontSize: 15 },
  rewardBtn: { marginLeft: 'auto', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#FFF3B0' },
  count: { fontSize: 16, color: '#8A7A62', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#F6F1E1', borderWidth: 2, borderColor: 'transparent' },
  cardMain: { borderColor: '#F5B700' },
  itemEmoji: { fontSize: 48 },
  name: { marginTop: 8, fontSize: 17, color: '#4A3B2A', fontWeight: '600' },
  rarity: { color: '#8A7A62', fontSize: 13, marginTop: 2 },
  tag: { marginTop: 4, color: '#4CAF50', fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#FFFDF5', borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, width: '100%', maxWidth: 340 },
});
