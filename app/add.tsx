import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BirdSprite } from '../src/components/BirdSprite';
import { Btn, Screen, card } from '../src/components/Screen';
import { getCharacter } from '../src/data/characters';
import { makeFriend } from '../src/data/templates';
import { parseSerial } from '../src/native/friendCode';
import { useStore } from '../src/state/store';

// 친구 수락 창: 상대 캐릭터를 보여주고 내 캐릭터와 나란히 자랑한다. (딥링크 owlet://add?code=... 도 여기로 온다)
export default function AddFriendScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();
  const { mainId, friends, addFriend } = useStore();
  const parsed = code ? parseSerial(String(code)) : null;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!parsed) {
    return (
      <Screen title="친구 추가">
        <Text style={card.p}>올바른 친구 코드가 아니에요.</Text>
        <Btn label="닫기" tone="gray" onPress={close} />
      </Screen>
    );
  }
  const ch = getCharacter(parsed.charId);
  const id = `f-${parsed.serial}`;
  const already = friends.some((f) => f.id === id);
  const name = `새친구 ${parsed.tag.slice(0, 4)}`;

  return (
    <Screen title="친구 추가">
      <View style={[card.box, { alignItems: 'center' }]}>
        <View style={styles.pair}>
          <View style={styles.side}><BirdSprite character={getCharacter(mainId)} size={56} /><Text style={card.p}>내 새</Text></View>
          <Text style={{ fontSize: 28 }}>🤝</Text>
          <View style={styles.side}><BirdSprite character={ch} size={56} /><Text style={card.p}>{ch.name}</Text></View>
        </View>
        <Text style={card.h}>{name}</Text>
        <Text style={card.p}>{parsed.serial}</Text>
        {already ? (
          <Text style={card.p}>이미 친구예요</Text>
        ) : (
          <Btn label="친구 수락" onPress={() => { addFriend(makeFriend(id, name, ch.emoji)); close(); }} />
        )}
        <Btn label="닫기" tone="gray" onPress={close} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  side: { alignItems: 'center', gap: 4 },
});
