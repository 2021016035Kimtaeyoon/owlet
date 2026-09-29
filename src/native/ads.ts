// 보상형 광고 자리. 지금은 모의 광고(카운트다운)이며, 실제 광고 SDK(AdMob 등)는
// development build + 광고 단위 ID가 있어야 하므로 이 함수만 교체하면 된다.
type Listener = (resolve: (watched: boolean) => void) => void;
let listener: Listener | null = null;

export const registerAdHost = (l: Listener | null) => { listener = l; };

export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => (listener ? listener(resolve) : resolve(false)));
}
