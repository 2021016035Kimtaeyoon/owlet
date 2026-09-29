// 결제 자리. 지금은 모의 결제(항상 성공)이며, 실제 결제는 스토어 계정 + 인앱 결제 SDK가 필요하다.
export type ProductId = 'coin_pack' | 'egg_pack';
export async function purchase(_id: ProductId): Promise<boolean> {
  return true;
}
