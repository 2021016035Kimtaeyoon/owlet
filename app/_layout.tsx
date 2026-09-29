import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider } from '../src/state/store';

export default function RootLayout() {
  const router = useRouter();
  // 알림을 눌러 앱을 열면 편지 있으면 편지함, 없으면 홈
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => router.push('/open'));
    return () => sub.remove();
  }, [router]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="letter/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="incubator" options={{ presentation: 'modal' }} />
        </Stack>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
