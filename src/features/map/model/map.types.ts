// 좌표
export interface Coordinates {
  lat: number;
  lng: number;
}

// 방향

export interface CompassHeadingData {
  heading: number; // 0~360
  accuracy?: number;
}

export interface UseUserHeadingOptions {
  /** 우리가 실제 반영할 임계각(데드밴드) */
  triggerDeg?: number; // 기본 5 추천
  /** 센서 콜백 민감도(몇 도 변할 때 콜백 받을지) */
  updateDeg?: number;
  /** 최소 호출 간격(ms) */
  throttleMs?: number;
  /** 스무딩 강도: 0=즉시, 1=매우 둔감 */
  smoothAlpha?: number;
}
