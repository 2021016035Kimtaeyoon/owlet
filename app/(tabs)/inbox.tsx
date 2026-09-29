import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { findFriend, useStore } from '../../src/state/store';

export default function InboxScreen() {
  const router = useRouter();
  const { letters, friends } = useStore();
  return (
    <FlatList
      style={styles.root}
      data={letters}
      keyExtractor={(l) => l.id}
      ListEmptyComponent={<Text style={styles.empty}>아직 편지가 없어요. 편지를 써보세요!</Text>}
      renderItem={({ item: l }) => {
        const f = findFriend(friends, l.friendId);
        const unread = l.direction === 'received' && !l.read;
        return (
          <Pressable style={styles.item} onPress={() => router.push(`/letter/${l.id}`)}>
            <Text style={styles.emoji}>{f.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {l.direction === 'sent' ? `→ ${f.name}에게` : `← ${f.name}에게서`} {unread ? '🔴' : ''}
              </Text>
              <Text numberOfLines={1} style={styles.preview}>{l.text || (l.videoUri ? '(동영상)' : '(사진)')}</Text>
            </View>
            <Text style={styles.time}>{new Date(l.createdAt).toLocaleTimeString().slice(0, 5)}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFDF5' },
  empty: { textAlign: 'center', marginTop: 60, color: '#8A7A62' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderColor: '#EFE6CC' },
  emoji: { fontSize: 32 },
  name: { fontSize: 16, color: '#4A3B2A', fontWeight: '600' },
  preview: { color: '#8A7A62', marginTop: 2 },
  time: { color: '#B0A48A', fontSize: 12 },
});
