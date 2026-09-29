import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { LetterPaper } from '../../src/components/LetterPaper';
import { FRIENDS, getTemplate } from '../../src/data/templates';
import { useStore } from '../../src/state/store';

export default function LetterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { letters, markRead } = useStore();
  const letter = letters.find((l) => l.id === id);

  useEffect(() => {
    if (letter && !letter.read) markRead(letter.id);
  }, [letter, markRead]);

  if (!letter) return <Text style={styles.empty}>편지를 찾을 수 없어요</Text>;
  const f = FRIENDS.find((x) => x.id === letter.friendId) ?? FRIENDS[0];
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
      <LetterPaper
        template={getTemplate(letter.templateId)}
        text={letter.text}
        imageUri={letter.imageUri}
        header={letter.direction === 'sent' ? `${f.name}에게` : `${f.name}에게서`}
      />
      <Pressable style={styles.close} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
        <Text style={styles.closeText}>닫기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F1E1' },
  empty: { marginTop: 100, textAlign: 'center' },
  close: { marginTop: 16, alignSelf: 'center', backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24 },
  closeText: { color: '#fff', fontSize: 16 },
});
