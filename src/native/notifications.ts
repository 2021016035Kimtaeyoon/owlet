import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 앱이 켜져 있을 땐 홈의 새가 알려주므로 배너는 숨긴다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('letters', {
        name: '편지 도착',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** 답장 도착 시각에 로컬 알림 예약. 앱이 꺼져 있어도 OS가 발송한다. */
export const scheduleLetterNotification = (friendName: string, at: number) =>
  scheduleNotification('편지가 도착했어요 ✉️', `${friendName}에게서 답장이 왔어요`, at);

/** 지정 시각에 로컬 알림 예약 (모험 귀환, 부화 완료 등에도 사용) */
export async function scheduleNotification(title: string, body: string, at: number): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { url: 'owlet://open' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(at),
        channelId: 'letters',
      },
    });
  } catch (e) {
    console.warn('notification schedule failed', e);
  }
}
