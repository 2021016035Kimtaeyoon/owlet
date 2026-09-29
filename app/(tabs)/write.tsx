import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LetterPaper } from '../../src/components/LetterPaper';
import { getCharacter } from '../../src/data/characters';
import { CONFIG } from '../../src/data/config';
import { FRIENDS, TEMPLATES, getTemplate } from '../../src/data/templates';
import { useStore } from '../../src/state/store';

const FLY_MS = 1400;

export default function WriteScreen() {
  const router = useRouter();
  const { mainId, sendLetter } = useStore();
  const [friendId, setFriendId] = useState(FRIENDS[0].id);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string>();
  const [sending, setSending] = useState(false);
  const fly = useSharedValue(0);
  const { width, height } = Dimensions.get('window');

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const send = () => {
    if (!text.trim() && !imageUri) return;
    sendLetter({ friendId, templateId, text: text.trim(), imageUri });
    setSending(true);
    fly.value = 0;
    fly.value = withTiming(1, { duration: FLY_MS, easing: Easing.in(Easing.quad) });
    setTimeout(() => {
      setSending(false);
      setText('');
      setImageUri(undefined);
      router.navigate('/');
    }, FLY_MS + 100);
  };

  // 화면 중앙 → 오른쪽 위 밖으로
  const birdStyle = useAnimatedStyle(() => ({
    opacity: fly.value < 0.02 ? 0 : 1,
    transform: [
      { translateX: width / 2 - 40 + fly.value * (width * 0.7) },
      { translateY: height / 2 - 40 - fly.value * (height * 0.7) },
      { scaleX: -1 },
    ],
  }));

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>받는 친구</Text>
        <View style={styles.row}>
          {FRIENDS.map((f) => (
            <Chip key={f.id} on={f.id === friendId} label={`${f.emoji} ${f.name}`} onPress={() => setFriendId(f.id)} />
          ))}
        </View>
        <Text style={styles.label}>편지지</Text>
        <View style={styles.row}>
          {TEMPLATES.map((t) => (
            <Chip key={t.id} on={t.id === templateId} label={t.name} onPress={() => setTemplateId(t.id)} />
          ))}
        </View>
        <LetterPaper
          template={getTemplate(templateId)}
          text={text}
          imageUri={imageUri}
          editable
          onChangeText={setText}
          maxLength={CONFIG.letter.maxLength}
        />
        <View style={styles.row}>
          <Chip on={!!imageUri} label={imageUri ? '📷 사진 바꾸기' : '📷 사진 첨부'} onPress={pickImage} />
          {imageUri && <Chip on={false} label="✕ 사진 빼기" onPress={() => setImageUri(undefined)} />}
        </View>
        <Pressable style={[styles.send, sending && { opacity: 0.5 }]} onPress={send} disabled={sending}>
          <Text style={styles.sendText}>🕊️ 보내기</Text>
        </Pressable>
      </ScrollView>
      {sending && (
        <Animated.View pointerEvents="none" style={[styles.flyer, birdStyle]}>
          <Text style={{ fontSize: 64 }}>{getCharacter(mainId).emoji}</Text>
          <Text style={styles.flyerLetter}>✉️</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, on && styles.chipOn]} onPress={onPress}>
      <Text style={[styles.chipText, on && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F1E1' },
  content: { padding: 16, gap: 12 },
  label: { fontSize: 14, color: '#8A7A62' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#E8DFC4' },
  chipOn: { backgroundColor: '#4CAF50' },
  chipText: { color: '#4A3B2A', fontSize: 15 },
  send: { backgroundColor: '#4CAF50', borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  sendText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  flyer: { position: 'absolute', left: 0, top: 0, width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  flyerLetter: { position: 'absolute', bottom: -6, right: -6, fontSize: 32 },
});
