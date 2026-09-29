import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Character } from '../data/characters';

interface Props {
  character: Character;
  size?: number;
  /** 편지를 물고 있는지 (2단계) */
  holdingLetter?: boolean;
  /** 도감의 미획득 표시 */
  silhouette?: boolean;
}

// 캐릭터 렌더링은 전부 여기서만 한다. 이미지로 교체할 땐 이 컴포넌트만 수정.
export function BirdSprite({ character, size = 64, holdingLetter, silhouette }: Props) {
  return (
    <>
      <Text style={[styles.emoji, { fontSize: size }, silhouette && styles.silhouette]}>
        {silhouette ? '❔' : character.emoji}
      </Text>
      {holdingLetter && <Text style={[styles.letter, { fontSize: size * 0.5 }]}>✉️</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  emoji: { textAlign: 'center' },
  silhouette: { opacity: 0.35 },
  letter: { position: 'absolute', bottom: -4, right: -8 },
});
