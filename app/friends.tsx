import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { BirdSprite } from '../src/components/BirdSprite';
import { Btn, Screen, card } from '../src/components/Screen';
import { getCharacter } from '../src/data/characters';
import { NEARBY } from '../src/data/templates';
import { parseSerial, toLink } from '../src/native/friendCode';
import { useStore } from '../src/state/store';

export default function FriendsScreen() {
  const router = useRouter();
  const { serial, mainId, friends, nearbyEnabled } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [perm, requestPerm] = useCameraPermissions();
  const bird = getCharacter(mainId);

  const submit = (raw: string) => {
    const parsed = parseSerial(raw);
    if (!parsed) { setError('올바른 일련번호가 아니에요'); return; }
    setError(''); setScanning(false);
    router.push({ pathname: '/add', params: { code: parsed.serial } });
  };
  const openScanner = async () => {
    if (!perm?.granted && !(await requestPerm()).granted) { setError('카메라 권한이 없어서 일련번호를 직접 입력해 주세요'); return; }
    setScanning(true);
  };

  return (
    <Screen title="친구">
      <View style={[card.box, { alignItems: 'center' }]}>
        <BirdSprite character={bird} size={56} />
        <Text style={card.h}>내 목걸이 일련번호</Text>
        <Text selectable style={styles.serial}>{serial}</Text>
        <QRCode value={toLink(serial)} size={140} />
        <Btn label="링크로 공유" tone="gray" onPress={() => Share.share({ message: `새 메신저에서 친구가 되어요! ${toLink(serial)}` }).catch(() => {})} />
      </View>

      <View style={card.box}>
        <Text style={card.h}>친구 추가</Text>
        <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="OWL-0-ABC123" autoCapitalize="characters" />
        <View style={card.row}>
          <Btn label="입력한 번호로 추가" onPress={() => submit(code)} />
          {Platform.OS !== 'web' && <Btn label="QR 스캔" tone="gold" onPress={openScanner} />}
        </View>
        {!!error && <Text style={styles.err}>{error}</Text>}
      </View>

      <View style={card.box}>
        <Text style={card.h}>내 친구 {friends.length}명</Text>
        {friends.map((f) => (
          <Text key={f.id} style={card.p}>{f.emoji} {f.name}</Text>
        ))}
      </View>

      <View style={card.box}>
        <Text style={card.h}>📡 주변 사용자</Text>
        {nearbyEnabled ? (
          <>
            <Text style={card.p}>편지 쓰기에서 아래 사용자에게도 보낼 수 있어요. (서버가 없어서 예시 사용자예요)</Text>
            {NEARBY.map((f) => <Text key={f.id} style={card.p}>{f.emoji} {f.name}</Text>)}
          </>
        ) : (
          <>
            <Text style={card.p}>설정에서 "주변 사용자에게 보내기"를 허용하면 모르는 사람에게도 편지를 보낼 수 있어요.</Text>
            <Btn label="설정으로" tone="gray" onPress={() => router.replace('/settings')} />
          </>
        )}
      </View>

      <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => submit(data)}
          />
          <Pressable style={styles.scanClose} onPress={() => setScanning(false)}>
            <Text style={{ color: '#fff', fontSize: 18 }}>닫기</Text>
          </Pressable>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  serial: { fontSize: 22, fontWeight: '700', letterSpacing: 2, color: '#4A3B2A' },
  input: { borderWidth: 1, borderColor: '#D9CFB0', borderRadius: 10, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  err: { color: '#C0392B', fontSize: 13 },
  scanClose: { position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 24 },
});
