// 편지지 양식 목록. 양식 추가는 이 파일만 수정한다. (2단계에서 사용)
export interface LetterTemplate {
  id: string;
  name: string;
  background: string;
  textColor: string;
  borderColor: string;
  /** 배경 위에 흩뿌릴 장식 이모지 */
  decor: string[];
}

export const TEMPLATES: LetterTemplate[] = [
  { id: 'plain', name: '기본', background: '#FFFDF5', textColor: '#4A3B2A', borderColor: '#E6D9B8', decor: [] },
  { id: 'flower', name: '꽃무늬', background: '#FFF0F5', textColor: '#6B3350', borderColor: '#F4B6CC', decor: ['🌸', '🌼', '🌷'] },
  { id: 'night', name: '밤하늘', background: '#1C2541', textColor: '#F1F1E6', borderColor: '#5C6BC0', decor: ['⭐', '🌙', '✨'] },
];

export const getTemplate = (id: string): LetterTemplate =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

// 더미 친구 (2단계에서 사용)
export interface Friend { id: string; name: string; emoji: string; replies: string[] }
export const FRIENDS: Friend[] = [
  { id: 'f1', name: '포로롱', emoji: '🐤', replies: ['편지 잘 받았어! 고마워 😊', '오늘 날씨 좋다~', '답장이 늦었지? 미안!'] },
  { id: 'f2', name: '달빛', emoji: '🌙', replies: ['밤하늘 보면서 읽었어.', '잘 지내고 있어?', '다음에 또 써줘!'] },
  { id: 'f3', name: '토리', emoji: '🐿️', replies: ['도토리 하나 보낼게!', '헤헤, 반가워!', '편지 오는 게 제일 좋아.'] },
];
