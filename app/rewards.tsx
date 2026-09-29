import React from 'react';
import { Text, View } from 'react-native';
import { Btn, Screen, card } from '../src/components/Screen';
import { REWARDS } from '../src/data/items';
import { rewardInput, useStore } from '../src/state/store';

export default function RewardsScreen() {
  const s = useStore();
  const input = rewardInput(s);
  return (
    <Screen title="리워드">
      {REWARDS.map((r) => {
        const v = Math.min(r.value(input), r.goal);
        const done = s.claimedRewards.includes(r.id);
        const can = !done && v >= r.goal;
        return (
          <View key={r.id} style={[card.box, card.row]}>
            <View style={{ flex: 1 }}>
              <Text style={card.h}>{r.label}</Text>
              <Text style={card.p}>진행 {v}/{r.goal} · 🪙 {r.coins}{r.eggs ? ` · 🥚 ${r.eggs}` : ''}</Text>
            </View>
            <Btn label={done ? '수령함' : '받기'} disabled={!can} onPress={() => s.claimReward(r.id)} />
          </View>
        );
      })}
    </Screen>
  );
}
