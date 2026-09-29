// 네이티브 설정은 전부 여기서 처리한다. prebuild를 다시 해도 유지된다.
const { AndroidConfig, withEntitlementsPlist } = require('expo/config-plugins');

const APP_GROUP = 'group.com.owlet.app'; // modules/owlet-shared/ios/OwletSharedModule.swift 와 동일해야 함

module.exports = function withOwletNative(config) {
  // iOS: App Group (앱 ↔ 위젯 공유 UserDefaults)
  config = withEntitlementsPlist(config, (c) => {
    const groups = c.modResults['com.apple.security.application-groups'] ?? [];
    if (!groups.includes(APP_GROUP)) groups.push(APP_GROUP);
    c.modResults['com.apple.security.application-groups'] = groups;
    return c;
  });

  // Android: 오버레이(5단계)·알림에 필요한 권한
  config = AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.SCHEDULE_EXACT_ALARM',
  ]);
  return config;
};
