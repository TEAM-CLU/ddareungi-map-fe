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

  // U-TURN 계열(백엔드 sign 변동 대응)
  '-8': require('@/assets/imgs/instruction/arrow_left.png'),
  '8': require('@/assets/imgs/instruction/arrow_right.png'),
  '-11': require('@/assets/imgs/instruction/arrow_left.png'),
  '11': require('@/assets/imgs/instruction/arrow_right.png'),
  '-98': require('@/assets/imgs/instruction/arrow_left.png'),
  '98': require('@/assets/imgs/instruction/arrow_right.png'),
};
export const BIKING_POLYLINE_COLORS = [
  '#00E676', // 0 Green
  '#00B0FF', // 1 Blue
  '#FF9100', // 2 Orange
  '#FF4081', // 3 Pink
] as const;

export const THROTTLE_WAIT_MS = 2000;

export const ACCURACY_OK = 40;

export const TTS_URL_PRESET = {
  FALLBACK_TTS_URL: require('@/assets/audios/errorTts.mp3'),
  START_TTS_URL: require('@/assets/audios/startTts.mp3'),
  END_TTS_URL: require('@/assets/audios/endTts.mp3'),
  FINISH_TTS_URL: require('@/assets/audios/finishTts.mp3'),
  CURRENT_FIXED_TTS_URL: require('@/assets/audios/currentFixedTts.mp3'),
  PREVIEW_FIXED_TTS_URL: require('@/assets/audios/previewFixedTts.mp3'),
  ARRIVE_WAYPOINT_TTS_URL: require('@/assets/audios/arriveWaypointTts.mp3'),
  REROUTE_TTS_URL: require('@/assets/audios/rerouteTts.mp3'),
  RECOVER_TTS_URL: require('@/assets/audios/recoverTts.mp3'),
  SUCCESS_REROUTE_TTS_URL: require('@/assets/audios/successRerouteTts.mp3'),
  WARNING_OFFROUTE_TTS_URL: require('@/assets/audios/warnOffRouteTts.mp3'),
};

// navigationTurn.constants.ts
export const MOTION_COMMON_OPTIONS = {
  MAX_PHYSICAL_SPEED_MPS: 15,
  PASS_CONFIRM_COUNT: 3,
  DT_SEC_CAP: 3,
  BACKGROUND_RESUME_RESET_GAP_SEC: 10,
  MIN_EFFECTIVE_SPEED_MPS: 1.0,
  MAX_ETA_HOURS: 12,
} as const;

export const TURN_CONFIG = {
  // 턴포인트 50m 이내 진입 시 감지 시작 (40 → 50: 더 여유 있게 사전 감지)
  ENTRY_RADIUS_METER: 50,
  // 70m 이상 멀어지면 리셋 (60 → 70: 좁은 골목/커브에서 오탈출 방지)
  EXIT_RADIUS_METER: 70,
  // 3m 이상 멀어져야 "멀어지는 중" (6 → 3: 조금만 벗어나도 카운트)
  DEADZONE_DISTANCE_METER: 3,
  // 최소 유효 이동 거리 (기존 유지)
  MIN_EFFECTIVE_MOVE_METER: 10,
  DOT_DEADZONE: 0,
  PASS_COUNT_DECAY: 1,
  // 최대 카운트 기존 유지
  PASS_COUNT_MAX: 3,
} as const;

export const TRAVELED_DISTANCE_OPTIONS = {
  STOP_JUDGE_MOVE_METER: 10,
} as const;

export const REMAINING_DISTANCE_OPTIONS = {
  REACHED_JUDGE_DISTANCE_METER: 5,
} as const;

export const INTERVAL_DISTANCE_OPTIONS = {
  MIN_INTERVAL_DISTANCE_METER: 10,
} as const;

export const WAYPOINT_CONFIG = {
  // waypoint 근처로 들어왔다 판정 (20 → 30: 자전거 속도에서 더 일찍 감지)
  ENTRY_RADIUS_METER: 30,
  // 다시 멀어지면 지나침 확정 후보 (35 → 45)
  EXIT_RADIUS_METER: 45,
  // 2회 반복되면 진짜 지나침 (기존 유지)
  PASS_CONFIRM_COUNT: 2,
};

// classifyTransportBySpeed.ts
export const SPEED_THRESHOLDS = {
  WALK_MAX_MPS: 2.3, // 대략 8.3km/h
  BIKING_MIN_MPS: 2.8, // 대략 10km/h
};

// 주행/정지 상태 추적
export const TRANSPORT_STATE_CONFIG = {
  // 주행 상태 판단
  BIKING_STATE_THRESHOLD: 3, // 3회 연속 biking 판정 시 주행 상태로 간주

  // 정지 상태 판단
  STATIONARY_THRESHOLD: 3, // 3회 연속 정지 판정 시 정지 상태로 간주
  STATIONARY_DISTANCE_THRESHOLD: 2, // 2m 이하 이동 시 정지로 판단
} as const;

// InstructionBanner.tsx
export const PREVIEW_CONIFG = {
  PREVIEW_THRESHOLD_METER: 50,
  PREVIEW_ENTER_COUNT_MIN: 2,
};
export const PREVIEW_THRESHOLD_METER = 50;

// 재탐색 관련
export const OFF_ROUTE_CONFIG = {
  // 이 정도 벗어나면 "경로로 복귀하세요" (soft)
  RECOVERY_TRIGGER_METER: 300,

  // 이 정도면 "경로 이탈 → 재탐색" (hard)
  REROUTE_TRIGGER_METER: 500,

  // bestIdx 튐 방지: 이전 bestIdx 기준 ±N개만 탐색
  CLOSEST_INDEX_WINDOW_SIZE: 5,

  // 재탐색 카운트 정책
  MAX_TRIGGER_COUNT: 3,

  // 재탐색/복귀 카운트 감쇠량
  COUNT_DECAY: 1,

  // 재탐색은 시작 초반(출발지 인근)에서만 허용
  REROUTE_MAX_TRAVELED_METER: 120,
  REROUTE_MAX_INTERVAL_INDEX: 1,

  // 새 경로 적용 직후 즉시 off-route 재트리거 방지
  POST_APPLY_JUDGE_COOLDOWN_MS: 7000,

  // reroute 직후 recovery 즉시 재발동 방지
  POST_REROUTE_RECOVERY_LOCK_MS: 30_000,
};

// playTts.ts
const COOLDOWN_ADDITIONAL_MS = 2000;
export interface TtsItem {
  key: string;
  url: string;
  volume: number;
  enqueuedAt: number;
}
/**
 * "재생 시작" 기준으로 같은 key를 막는 시간(ms)
 * - offroute 류는 길게(난사 방지)
 * - turn/preview는 짧게(UX)
 * - waypoint/arrive는 중간
 */
export const COOLDOWN_BY_KEY: Record<string, number> = {
  // start / arrive
  'tts-navigation-start': 4000 + COOLDOWN_ADDITIONAL_MS,
  'tts-navigation-end': 1000 + COOLDOWN_ADDITIONAL_MS,
  // off-route
  'tts-offroute-warning': 4000 + COOLDOWN_ADDITIONAL_MS,
  'tts-offroute-recover': 3000 + COOLDOWN_ADDITIONAL_MS,
  'tts-offroute-reroute': 4000 + COOLDOWN_ADDITIONAL_MS,
  'tts-offroute-reroute-success': 2000 + COOLDOWN_ADDITIONAL_MS,

  // waypoint
  'tts-waypoint-arrive': 2000 + COOLDOWN_ADDITIONAL_MS,

  // turn / preview 등(필요시 너가 키 맞춰서 추가)
  'tts-turn': 2000 + COOLDOWN_ADDITIONAL_MS,
  'tts-preview': 3000 + COOLDOWN_ADDITIONAL_MS,
  'tts-tap': 500,
};

export const DEFAULT_COOLDOWN_MS = 3000;
