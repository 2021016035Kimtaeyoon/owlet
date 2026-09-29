/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'OwletWidget',
  displayName: '새 메신저',
  deploymentTarget: '16.0',
  frameworks: ['SwiftUI', 'WidgetKit'],
  // 앱과 같은 App Group을 공유해야 상태를 읽을 수 있다 (plugins/withOwletNative.js 와 동일)
  entitlements: {
    'com.apple.security.application-groups': ['group.com.owlet.app'],
  },
};
