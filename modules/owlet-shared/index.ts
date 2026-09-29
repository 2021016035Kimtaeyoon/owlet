import { requireOptionalNativeModule } from 'expo-modules-core';

interface OwletSharedNative {
  setState(json: string): void;
  getState(): string | null;
  reloadWidgets(): void;
  // Android 오버레이 (iOS에서는 존재하지 않음)
  canDrawOverlays?(): boolean;
  requestOverlayPermission?(): void;
  startOverlay?(): void;
  stopOverlay?(): void;
  consumeOverlayOffRequest?(): boolean;
}

// Expo Go 등 네이티브 모듈이 없는 환경에서는 null → 호출은 조용히 무시된다.
export default requireOptionalNativeModule<OwletSharedNative>('OwletShared');
