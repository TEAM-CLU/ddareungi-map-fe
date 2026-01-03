export const DIRECTION_ICONS: Record<string, any> = {
  // KEEP_LEFT
  '-7': require('@/assets/imgs/instruction/arrow_keep_left.png'),

  // Left Turns (Sharp, Normal, Slight) -> All map to 'left'
  '-3': require('@/assets/imgs/instruction/arrow_left.png'),
  '-2': require('@/assets/imgs/instruction/arrow_left.png'),
  '-1': require('@/assets/imgs/instruction/arrow_left.png'),

  // CONTINUE_ON_STREET
  '0': require('@/assets/imgs/instruction/arrow_straight.png'),

  // Right Turns (Slight, Normal, Sharp) -> All map to 'right'
  '1': require('@/assets/imgs/instruction/arrow_right.png'),
  '2': require('@/assets/imgs/instruction/arrow_right.png'),
  '3': require('@/assets/imgs/instruction/arrow_right.png'),

  // FINISH
  '4': require('@/assets/imgs/instruction/destination.png'),

  // VIA_POINT
  '5': require('@/assets/imgs/instruction/waypoint.png'),

  // USE_ROUNDABOUT
  '6': require('@/assets/imgs/instruction/roundabout.png'),

  // KEEP_RIGHT
  '7': require('@/assets/imgs/instruction/arrow_keep_right.png'),
};

export const THROTTLE_WAIT_MS = 2000;

export const ACCURACY_OK = 40;

export const FALLBACK_TTS_URL =
  'https://ddareungimap-tts-cache.s3.amazonaws.com/tts/ko-KR/b51d71d80e0025ab88bc5d697a3f91b32146b94b7d41cb3573c244d05f8a3110.mp3';

// navigationTurn.constants.ts

export const TURN_CONFIG = {
  // entry / exit 반경
  ENTRY_RADIUS_METER: 20, // 턴 진입 반경
  EXIT_RADIUS_METER: 35, // 턴 이탈 반경 (ENTRY보다 크게)

  // 통과 확정 조건
  PASS_CONFIRM_COUNT: 3, // 연속 N번 통과 시 확정

  // 거리 / 이동 보정 관련
  DEADZONE_DISTANCE_METER: 6, // 거리 변화 deadzone (GPS 흔들림 무시)
  MIN_MOVE_METER: 10, // 방향(dot) 판정 최소 이동 거리
  MAX_SPEED_MPS: 20, // 최대 허용 속도 (GPS 점프 방지)

  // dot(내적) 보정 관련
  DOT_DEADZONE: 0, // 0이면 부호만 사용 (음수 = 멀어짐)

  // pass count 정책
  PASS_COUNT_DECAY: 1, // 조건 불만족 시 감소량
  PASS_COUNT_MAX: 3, // 과도 증가 방지 (보통 PASS_CONFIRM_COUNT와 동일)
} as const;

export const TRAVELED_DISTANCE_OPTIONS = {
  MAX_SPEED_MPS: 20,
  STOP_JUDGE_MOVE_METER: 3,
} as const;
