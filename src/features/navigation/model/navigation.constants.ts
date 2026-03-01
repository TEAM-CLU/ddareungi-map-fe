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
} as const;

export const TURN_CONFIG = {
  ENTRY_RADIUS_METER: 40,
  EXIT_RADIUS_METER: 60,
  DEADZONE_DISTANCE_METER: 6,
  MIN_EFFECTIVE_MOVE_METER: 10,
  DOT_DEADZONE: 0,
  PASS_COUNT_DECAY: 1,
  PASS_COUNT_MAX: 3,
} as const;

export const TRAVELED_DISTANCE_OPTIONS = {
  STOP_JUDGE_MOVE_METER: 5,
} as const;

export const REMAINING_DISTANCE_OPTIONS = {
  REACHED_JUDGE_DISTANCE_METER: 5,
} as const;

export const INTERVAL_DISTANCE_OPTIONS = {
  MIN_INTERVAL_DISTANCE_METER: 10,
} as const;

export const WAYPOINT_CONFIG = {
  ENTRY_RADIUS_METER: 20, // waypoint 근처로 들어왔다 판정
  EXIT_RADIUS_METER: 35, // 다시 멀어지면 지나침 확정 후보
  PASS_CONFIRM_COUNT: 2, // 2회 반복되면 진짜 지나침
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
  RECOVERY_TRIGGER_METER: PREVIEW_THRESHOLD_METER,

  // 이 정도면 "경로 이탈 → 재탐색" (hard)
  REROUTE_TRIGGER_METER: 150,

  // bestIdx 튐 방지: 이전 bestIdx 기준 ±N개만 탐색
  CLOSEST_INDEX_WINDOW_SIZE: 5,

  // 재탐색 카운트 정책
  MAX_TRIGGER_COUNT: 3,

  // 재탐색/복귀 카운트 감쇠량
  COUNT_DECAY: 1,
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
