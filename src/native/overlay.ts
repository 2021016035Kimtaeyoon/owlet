import { Platform } from 'react-native';
import Shared from '../../modules/owlet-shared';

const isAndroid = Platform.OS === 'android' && !!Shared;

export const overlaySupported = isAndroid;
export const canDrawOverlays = (): boolean => (isAndroid ? !!Shared?.canDrawOverlays?.() : false);
export const requestOverlayPermission = () => Shared?.requestOverlayPermission?.();

/** 설정값 + 권한에 맞춰 서비스를 켜거나 끈다. 권한이 없으면 아무 일도 하지 않는다(앱은 정상 동작). */
export function applyOverlay(enabled: boolean): void {
  if (!isAndroid) return;
  try {
    if (enabled && canDrawOverlays()) Shared?.startOverlay?.();
    else Shared?.stopOverlay?.();
  } catch (e) {
    console.warn('applyOverlay failed', e);
  }
}

/** 오버레이 메뉴에서 "오버레이 끄기"를 눌렀는지 확인 (한 번 읽으면 초기화) */
export const consumeOverlayOffRequest = (): boolean => (isAndroid ? !!Shared?.consumeOverlayOffRequest?.() : false);
