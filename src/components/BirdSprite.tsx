import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Character } from '../data/characters';
import { getDecor } from '../data/items';
import { useStore } from '../state/store';
import { PixelSprite, hasPixelSprite } from './PixelSprite';

interface Props {
  character: Character;
  size?: number;
  /** 편지를 물고 있는지 */
  holdingLetter?: boolean;
  /** 도감의 미획득 표시 */
  silhouette?: boolean;
  /** 꾸미기 아이템 id (예: acc-crown) */
  accessoryId?: string;
}

// 캐릭터 렌더링은 전부 여기서만 한다. 이모지/도트(설정에서 선택). 이미지로 교체할 땐 이 컴포넌트만 수정.
export function BirdSprite({ character, size = 64, holdingLetter, silhouette, accessoryId }: Props) {
  const { graphicStyle } = useStore();
  const usePixel = graphicStyle === 'pixel' && hasPixelSprite(character.id) && !silhouette;
  const acc = accessoryId && accessoryId !== 'acc-none' ? getDecor(accessoryId) : undefined;
  return (
    <View style={styles.box}>
      {silhouette ? (
        <Text style={[styles.emoji, { fontSize: size, opacity: 0.35 }]}>❔</Text>
      ) : usePixel ? (
        <PixelSprite id={character.id} size={size} />
      ) : (
        <Text style={[styles.emoji, { fontSize: size }]}>{character.emoji}</Text>
      )}
      {acc && (
        <Text style={[styles.acc, { fontSize: size * 0.4, top: -size * 0.12, right: size * 0.05 }]}>{acc.emoji}</Text>
      )}
      {holdingLetter && <Text style={[styles.letter, { fontSize: size * 0.5 }]}>✉️</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  emoji: { textAlign: 'center' },
  acc: { position: 'absolute' },
  letter: { position: 'absolute', bottom: -4, right: -8 },
});
