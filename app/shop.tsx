import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Btn, Screen, card } from '../src/components/Screen';
import { CONFIG2 } from '../src/data/config';
import { showRewardedAd } from '../src/native/ads';
import { purchase } from '../src/native/iap';
import { useStore } from '../src/state/store';

export default function ShopScreen() {
  const { coins, addCoins, spendCoins, update, eggs } = useStore();
  const [msg, setMsg] = useState('');
  const P = CONFIG2.shop;
  return (
    <Screen title="상점">
      <Text style={card.p}>광고와 결제는 모의 동작이에요. 실제 광고·결제는 스토어 계정과 SDK 연결이 필요해요.</Text>
      <View style={card.box}>
        <Text style={card.h}>🥚 알 구매</Text>
        <Text style={card.p}>🪙 {P.eggPrice} · 보유 알 {eggs}개</Text>
        <Btn label="구매" tone="gold" disabled={coins < P.eggPrice} onPress={() => {
          if (spendCoins(P.eggPrice)) { update({ eggs: eggs + 1 }); setMsg('알을 샀어요!'); }
        }} />
      </View>
      <View style={card.box}>
        <Text style={card.h}>📺 광고 보고 코인 받기</Text>
        <Text style={card.p}>🪙 +{P.adCoins}</Text>
        <Btn label="광고 보기" onPress={async () => {
          if (await showRewardedAd()) { addCoins(P.adCoins); setMsg(`코인 +${P.adCoins}`); }
        }} />
      </View>
      <View style={card.box}>
        <Text style={card.h}>💰 코인 팩 (모의 결제)</Text>
        <Text style={card.p}>🪙 +{P.coinPackCoins}</Text>
        <Btn label="구매(모의)" tone="gold" onPress={async () => {
          if (await purchase('coin_pack')) { addCoins(P.coinPackCoins); setMsg(`코인 +${P.coinPackCoins}`); }
        }} />
      </View>
      {!!msg && <Text style={[card.p, { textAlign: 'center' }]}>{msg}</Text>}
    </Screen>
  );
}
