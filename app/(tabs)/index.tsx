import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BirdMenu } from '../../src/components/BirdMenu';
import { FlyingBird } from '../../src/components/FlyingBird';
import { HomeScene, getNestPos } from '../../src/components/HomeScene';
import { getCharacter } from '../../src/data/characters';
import { useStore } from '../../src/state/store';

export default function HomeScreen() {
  const router = useRouter();
  const { mainId, birdMode, ready, update } = useStore();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const character = getCharacter(mainId);

  const menu = [
    { label: '🙈 숨기기', onPress: () => update({ birdMode: 'hidden' }) },
    { label: '🪹 구석에서 쉬기', onPress: () => update({ birdMode: 'rest' }) },
    { label: '🥚 부화장치', onPress: () => Alert.alert('부화장치', '3단계에서 구현됩니다.') },
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
            onTap={() => birdMode === 'rest' && update({ birdMode: 'fly' })}
          />
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
  callText: { fontSize: 18, color: '#4A3B2A' },
});
