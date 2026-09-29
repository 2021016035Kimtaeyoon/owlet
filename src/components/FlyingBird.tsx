import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Character } from '../data/characters';
import { CONFIG } from '../data/config';
import { BirdMode } from '../state/store';
import { BirdSprite } from './BirdSprite';
import { Point } from './HomeScene';

interface Props {
  character: Character;
  mode: BirdMode;
  width: number;
  height: number;
  nest: Point;
  holdingLetter?: boolean;
  accessoryId?: string;
  onLongPress: () => void;
  onTap: () => void;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function FlyingBird({ character, mode, width, height, nest, holdingLetter, accessoryId, onLongPress, onTap }: Props) {
  const size = CONFIG.wander.birdSize;
  const x = useSharedValue(width / 2);
  const y = useSharedValue(height * 0.3);
  const flip = useSharedValue(1);
  const bob = useSharedValue(0);
  const startPos = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  // 이동 로직: 모드/드래그 상태가 바뀔 때마다 다시 시작
  useEffect(() => {
    if (dragging || mode === 'hidden') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let alive = true;
    const flyTo = (tx: number, ty: number, duration: number, done?: () => void) => {
      flip.value = tx >= x.value ? -1 : 1; // 이모지는 왼쪽을 보므로 오른쪽으로 갈 땐 뒤집기
      const cfg = { duration, easing: Easing.inOut(Easing.quad) };
      x.value = withTiming(tx, cfg);
      y.value = withTiming(ty, cfg);
      if (done) timer = setTimeout(() => alive && done(), duration);
    };

    if (mode === 'rest') {
      flyTo(nest.x, nest.y, 1400);
      bob.value = withTiming(0, { duration: 300 });
    } else {
      bob.value = withRepeat(
        withSequence(withTiming(-6, { duration: 450 }), withTiming(0, { duration: 450 })),
        -1,
      );
      const loop = () => {
        const w = CONFIG.wander;
        const dur = rand(w.minDurationMs, w.maxDurationMs);
        const tx = rand(size, width - size);
        const ty = rand(size + 20, height * 0.7);
        flyTo(tx, ty, dur, () => {
          timer = setTimeout(() => alive && loop(), rand(w.pauseMinMs, w.pauseMaxMs));
        });
      };
      loop();
    }
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(bob);
    };
  }, [mode, dragging, width, height, nest.x, nest.y, size, x, y, flip, bob]);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(8)
    .onStart(() => {
      cancelAnimation(x);
      cancelAnimation(y);
      startPos.current = { x: x.value, y: y.value };
      setDragging(true);
    })
    .onUpdate((e) => {
      x.value = startPos.current.x + e.translationX;
      y.value = startPos.current.y + e.translationY;
    })
    .onEnd(() => {
      x.value = Math.min(Math.max(x.value, size / 2), width - size / 2);
      y.value = Math.min(Math.max(y.value, size / 2), height - size / 2);
      setDragging(false);
    });
  const longPress = Gesture.LongPress().runOnJS(true).minDuration(500).onStart(onLongPress);
  const tap = Gesture.Tap().runOnJS(true).onEnd((_e, ok) => ok && onTap());
  const gesture = Gesture.Race(pan, longPress, tap);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - size / 2 }, { translateY: y.value - size / 2 + bob.value }, { scaleX: flip.value }],
  }));

  if (mode === 'hidden') return null;
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.bird, { width: size, height: size }, style]}>
        <BirdSprite character={character} size={size * 0.85} holdingLetter={holdingLetter} accessoryId={accessoryId} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  bird: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
});
