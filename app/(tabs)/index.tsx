import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BirdMenu } from '../../src/components/BirdMenu';
import { FlyingBird } from '../../src/components/FlyingBird';
import { HomeScene, getNestPos } from '../../src/components/HomeScene';
import { getCharacter } from '../../src/data/characters';
import { useStore } from '../../src/state/store';

export default function HomeScreen() {
  const router = useRouter();
  const { mainId, birdMode, ready, update, letters, eggs, eggNotice, incubatorStartedAt } = useStore();
  const unread = letters.find((l) => l.direction === 'received' && !l.read);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const character = getCharacter(mainId);

  const menu = [
    { label: '🙈 숨기기', onPress: () => update({ birdMode: 'hidden' }) },
    { label: '🪹 구석에서 쉬기', onPress: () => update({ birdMode: 'rest' }) },
    { label: '🥚 부화장치', onPress: () => router.push('/incubator') },
    { label: '📖 도감', onPress: () => router.push('/dex') },
  ];

  return (
    <View style={styles.root} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && ready && (
        <>
          <HomeScene width={size.w} height={size.h} />
          <FlyingBird
            character={character}
            mode={birdMode}
            width={size.w}
            height={size.h}
            nest={getNestPos(size.w, size.h)}
            onLongPress={() => setMenuOpen(true)}
            holdingLetter={!!unread}
            onTap={() => {
              if (unread) router.push(`/letter/${unread.id}`);
              else if (birdMode === 'rest') update({ birdMode: 'fly' });
            }}
          />
          {eggNotice && (
            <Pressable
              style={styles.notice}
              onPress={() => { update({ eggNotice: false }); router.push('/incubator'); }}
            >
              <Text style={styles.callText}>🥚 새가 알을 물어왔어요! (탭)</Text>
            </Pressable>
          )}
          {(eggs > 0 || incubatorStartedAt) && (
            <Pressable style={styles.eggBadge} onPress={() => router.push('/incubator')}>
              <Text style={styles.callText}>🥚 {eggs}{incubatorStartedAt ? ' ⏳' : ''}</Text>
            </Pressable>
          )}
          {birdMode === 'hidden' && (
            <Pressable style={styles.callBtn} onPress={() => update({ birdMode: 'fly' })}>
              <Text style={styles.callText}>{character.emoji} 새 부르기</Text>
            </Pressable>
          )}
          <BirdMenu visible={menuOpen} items={menu} onClose={() => setMenuOpen(false)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#9BD7F5' },
  callBtn: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: '#FFFDF5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24,
  },
  notice: {
    position: 'absolute', top: 56, alignSelf: 'center',
    backgroundColor: '#FFF3B0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20,
  },
  eggBadge: {
    position: 'absolute', top: 56, left: 16,
    backgroundColor: '#FFFDF5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16,
  },
  callText: { fontSize: 18, color: '#4A3B2A' },
});
