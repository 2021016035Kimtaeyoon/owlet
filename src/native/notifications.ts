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
export async function scheduleLetterNotification(friendName: string, at: number): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '편지가 도착했어요 ✉️',
        body: `${friendName}에게서 답장이 왔어요`,
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
