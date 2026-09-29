import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icon = (e: string) => () => <Text style={{ fontSize: 20 }}>{e}</Text>;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4CAF50' }}>
      <Tabs.Screen name="index" options={{ title: '홈', headerShown: false, tabBarIcon: icon('🏡') }} />
      <Tabs.Screen name="inbox" options={{ title: '편지함', tabBarIcon: icon('📬') }} />
      <Tabs.Screen name="write" options={{ title: '편지 쓰기', tabBarIcon: icon('✍️') }} />
      <Tabs.Screen name="dex" options={{ title: '도감', tabBarIcon: icon('📖') }} />
      <Tabs.Screen name="settings" options={{ title: '설정', tabBarIcon: icon('⚙️') }} />
    </Tabs>
  );
}
