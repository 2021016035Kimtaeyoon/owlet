import React from 'react';
import Svg, { Rect } from 'react-native-svg';

// 도트 그래픽. 문자 하나가 픽셀 하나. 캐릭터를 추가하려면 characters.ts에 등록하고 여기에 도트를 추가한다.
const PALETTE: Record<string, string> = {
  w: '#FFFFFF', g: '#9AA5B1', k: '#222222', o: '#F5A623', y: '#FFD23F',
  b: '#6B4423', B: '#B5793E', W: '#F6E7C8', r: '#E5484D', G: '#3FA34D', l: '#7BD389',
};

const SPRITES: Record<string, string[]> = {
  dove: [
    '............', '....gggg....', '...gwwwwg...', '..gwwkwwwg..', '.ooowwwwwwg.',
    '..ogwwwwwwgg', '....gwwwwwg.', '....gwwwwg..', '.....oo.oo..', '............',
  ],
  sparrow: [
    '............', '....bbbb....', '...bBBBBb...', '..bBBkBBBb..', '.yybBBBBBBb.',
    '..ybBWWWBbb.', '....bWWWWb..', '....bbbbb...', '.....yy.yy..', '............',
  ],
  owl: [
    '..b......b..', '..bbbbbbbb..', '.bBBBBBBBBb.', '.bWkWBBWkWb.', '.bWWWyyWWWb.',
    '.bBBBBBBBBb.', '.bBWBWBWBBb.', '..bBBBBBBb..', '...yy..yy...', '............',
  ],
  dragon: [
    '.r......r...', '..GGGGGG....', '.GllllllG.r.', '.GlkllklGrr.', '.GllllllG.r.',
    'GGGlllllGGGr', '..GlwlwlG...', '..GllllllG..', '..GG...GG...', '............',
  ],
};

export function hasPixelSprite(id: string) {
  return !!SPRITES[id];
}

export function PixelSprite({ id, size }: { id: string; size: number }) {
  const rows = SPRITES[id] ?? SPRITES.dove;
  const cols = rows[0].length;
  return (
    <Svg width={size} height={(size * rows.length) / cols} viewBox={`0 0 ${cols} ${rows.length}`}>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === '.' ? null : <Rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={PALETTE[ch] ?? '#000'} />,
        ),
      )}
    </Svg>
  );
}
