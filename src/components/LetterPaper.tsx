import React from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { LetterTemplate } from '../data/templates';

interface Props {
  template: LetterTemplate;
  text: string;
  imageUri?: string;
  editable?: boolean;
  onChangeText?: (t: string) => void;
  maxLength?: number;
  header?: string;
}

// 편지지 양식 렌더링: 새 양식은 templates.ts에 데이터만 추가하면 된다
export function LetterPaper({ template, text, imageUri, editable, onChangeText, maxLength, header }: Props) {
  const spots = [
    { top: 8, left: 10 }, { top: 10, right: 12 }, { bottom: 10, left: 14 }, { bottom: 8, right: 10 }, { top: '45%', right: 6 },
  ] as const;
  return (
    <View style={[styles.paper, { backgroundColor: template.background, borderColor: template.borderColor }]}>
      {template.decor.length > 0 &&
        spots.map((pos, i) => (
          <Text key={i} style={[styles.decor, pos]} pointerEvents="none">
            {template.decor[i % template.decor.length]}
          </Text>
        ))}
      {header ? <Text style={[styles.header, { color: template.textColor }]}>{header}</Text> : null}
      {editable ? (
        <TextInput
          style={[styles.text, { color: template.textColor }]}
          multiline
          value={text}
          onChangeText={onChangeText}
          maxLength={maxLength}
          placeholder="편지를 써보세요..."
          placeholderTextColor={template.textColor + '88'}
        />
      ) : (
        <Text style={[styles.text, { color: template.textColor }]}>{text}</Text>
      )}
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { borderWidth: 3, borderRadius: 12, padding: 24, minHeight: 240, overflow: 'hidden' },
  decor: { position: 'absolute', fontSize: 22 },
  header: { fontSize: 14, marginBottom: 8, opacity: 0.8 },
  text: { fontSize: 17, lineHeight: 28, minHeight: 100, textAlignVertical: 'top' },
  image: { width: '100%', height: 180, borderRadius: 8, marginTop: 12 },
});
