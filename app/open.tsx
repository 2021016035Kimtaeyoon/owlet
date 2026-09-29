import { Redirect } from 'expo-router';
import { useStore } from '../src/state/store';

// 딥링크 진입점: owlet://open (위젯/오버레이/알림 탭) → 편지 있으면 편지함, 없으면 홈
export default function OpenScreen() {
  const { ready, letters } = useStore();
  if (!ready) return null;
  const hasUnread = letters.some((l) => l.direction === 'received' && !l.read);
  return <Redirect href={hasUnread ? '/inbox' : '/'} />;
}
