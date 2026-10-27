import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Btn, Screen, card } from '../src/components/Screen';
import { generateFortune, parseBirthDate } from '../src/data/fortune';
import { useStore } from '../src/state/store';

export default function FortuneScreen() {
  const router = useRouter();
  const { profile, update, fortuneEnabled, letters } = useStore();
  const [editing, setEditing] = useState(!profile);
  const [name, setName] = useState(profile?.name ?? '');
  const [y, setY] = useState(profile?.birthDate.slice(0, 4) ?? '');
  const [m, setM] = useState(profile?.birthDate.slice(5, 7) ?? '');
  const [d, setD] = useState(profile?.birthDate.slice(8, 10) ?? '');
  const [error, setError] = useState('');

  const save = () => {
    const birthDate = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    if (!name.trim()) return setError('이름(별명)을 입력해 주세요');
    if (!parseBirthDate(birthDate)) return setError('생년월일을 확인해 주세요 (예: 1998 / 5 / 21)');
    setError('');
    // 저장하면 lastFortuneDate를 비워서 바로 오늘의 운세가 도착하게 한다
    update({ profile: { name: name.trim(), birthDate }, lastFortuneDate: '' });
    setEditing(false);
  };

  const f = profile ? generateFortune(profile) : null;
  const todayLetter = letters.find((l) => l.friendId === 'fortune' && l.direction === 'received');

  return (
    <Screen title="오늘의 운세">
      {editing ? (
        <View style={card.box}>
          <Text style={card.h}>내 정보</Text>
          <Text style={card.p}>이름과 생년월일은 이 기기에만 저장되고 서버로 보내지 않아요. 별자리와 띠를 바탕으로 한 재미용 운세예요.</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="이름 또는 별명" />
          <View style={card.row}>
            <TextInput style={[styles.input, { flex: 1.4 }]} value={y} onChangeText={setY} placeholder="연도" keyboardType="number-pad" maxLength={4} />
            <TextInput style={[styles.input, { flex: 1 }]} value={m} onChangeText={setM} placeholder="월" keyboardType="number-pad" maxLength={2} />
            <TextInput style={[styles.input, { flex: 1 }]} value={d} onChangeText={setD} placeholder="일" keyboardType="number-pad" maxLength={2} />
          </View>
          {!!error && <Text style={styles.err}>{error}</Text>}
          <Btn label="저장하고 오늘의 운세 받기" onPress={save} />
          {profile && <Btn label="취소" tone="gray" onPress={() => setEditing(false)} />}
        </View>
      ) : (
        profile && f && (
          <>
            <View style={card.box}>
              <Text style={card.h}>🔮 {profile.name}님의 오늘</Text>
              <Text style={card.p}>{f.sign} · {f.animal}띠</Text>
              <Text style={styles.stars}>{'★'.repeat(f.score)}{'☆'.repeat(5 - f.score)}</Text>
              <Text style={card.p}>{f.summary}</Text>
              <Text style={card.p}>💕 {f.love}</Text>
              <Text style={card.p}>💰 {f.money}</Text>
              <Text style={card.p}>💼 {f.work}</Text>
              <Text style={card.p}>행운의 색 {f.luckyColor} · 행운의 숫자 {f.luckyNumber}</Text>
              <Text style={styles.note}>재미로 보는 운세예요.</Text>
            </View>
            {todayLetter && <Btn label="받은 운세 편지 열기" onPress={() => router.push(`/letter/${todayLetter.id}`)} />}
            <View style={[card.box, card.row]}>
              <View style={{ flex: 1 }}>
                <Text style={card.h}>매일 아침 운세 받기</Text>
                <Text style={card.p}>매일 오전 8시에 새가 운세 편지를 물어오고, 위젯에도 한 줄이 나와요</Text>
              </View>
              <Switch value={fortuneEnabled} onValueChange={(v) => update({ fortuneEnabled: v })} />
            </View>
            <Btn label="내 정보 수정" tone="gray" onPress={() => setEditing(true)} />
          </>
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#D9CFB0', borderRadius: 10, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  err: { color: '#C0392B', fontSize: 13 },
  stars: { fontSize: 24, color: '#F5B700' },
  note: { fontSize: 12, color: '#8A7A62' },
});
