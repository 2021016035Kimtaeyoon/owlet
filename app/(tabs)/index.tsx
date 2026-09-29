import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BirdMenu } from '../../src/components/BirdMenu';
import { FlyingBird } from '../../src/components/FlyingBird';
import { HomeScene, getNestPos } from '../../src/components/HomeScene';
import { getCharacter } from '../../src/data/characters';
import { CONFIG2 } from '../../src/data/config';
import { getLocation } from '../../src/data/items';
import { useStore } from '../../src/state/store';

export default function HomeScreen() {
  const router = useRouter();
  const { mainId, birdMode, ready, update, letters, eggs, eggNotice, incubatorStartedAt, adventure, decorEquipped, coins } =
    useStore();
  const unread = letters.find((l) => l.direction === 'received' && !l.read);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const character = getCharacter(mainId);

  useEffect(() => {
    if (!adventure) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [adventure]);
  const loc = adventure ? getLocation(adventure.locId) : null;
  const advRemain = adventure && loc ? Math.max(0, adventure.startedAt + loc.durationMs * CONFIG2.adventure.durationScale - now) : 0;
  const away = !!adventure; // 모험 중에는 새가 집에 없다

  const menu = [
    { label: '🙈 숨기기', onPress: () => update({ birdMode: 'hidden' }) },
    { label: '🪹 구석에서 쉬기', onPress: () => update({ birdMode: 'rest' }) },
    { label: '🥚 부화장치', onPress: () => router.push('/incubator') },
    { label: '🧭 모험', onPress: () => router.push('/adventure') },
    { label: '📖 도감', onPress: () => router.push('/dex') },
    { label: '☰ 더보기 (꾸미기·배틀·랭킹…)', onPress: () => router.push('/hub') },
  ];

  return (
    <View style={styles.root} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && ready && (
        <>
          <HomeScene width={size.w} height={size.h} backgroundId={decorEquipped.background} nestId={decorEquipped.nest} />
          <FlyingBird
            character={character}
            mode={away ? 'hidden' : birdMode}
            width={size.w}
            height={size.h}
            nest={getNestPos(size.w, size.h)}
            holdingLetter={!!unread}
            accessoryId={decorEquipped.accessory}
            onLongPress={() => setMenuOpen(true)}
            onTap={() => {
              if (unread) router.push(`/letter/${unread.id}`);
              else if (birdMode === 'rest') update({ birdMode: 'fly' });
            }}
          />
          <Pressable style={styles.hubBtn} onPress={() => router.push('/hub')}>
            <Text style={styles.callText}>🪙 {coins}  ☰</Text>
          </Pressable>
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
          {adventure && loc && (
            <Pressable style={styles.callBtn} onPress={() => router.push('/adventure')}>
              <Text style={styles.callText}>
                {advRemain > 0 ? `🧭 ${loc.name} 탐험 중… ${Math.ceil(advRemain / 1000)}초` : '🧭 새가 돌아왔어요! 탭해서 확인'}
              </Text>
            </Pressable>
          )}
          {!away && birdMode === 'hidden' && (
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
    position: 'absolute', top: 100, alignSelf: 'center',
    backgroundColor: '#FFF3B0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20,
  },
  eggBadge: {
    position: 'absolute', top: 56, left: 16,
    backgroundColor: '#FFFDF5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16,
  },
  hubBtn: {
    position: 'absolute', top: 56, right: 16,
    backgroundColor: '#FFFDF5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16,
  },
  callText: { fontSize: 16, color: '#4A3B2A' },
});
