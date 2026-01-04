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
export const MOTION_COMMON_OPTIONS = {
  MAX_PHYSICAL_SPEED_MPS: 20,
} as const;

export const TURN_CONFIG = {
  ENTRY_RADIUS_METER: 20,
  EXIT_RADIUS_METER: 35,
  PASS_CONFIRM_COUNT: 3,
  DEADZONE_DISTANCE_METER: 6,
  MIN_EFFECTIVE_MOVE_METER: 10,
  DOT_DEADZONE: 0,
  PASS_COUNT_DECAY: 1,
  PASS_COUNT_MAX: 3,
} as const;

export const TRAVELED_DISTANCE_OPTIONS = {
  STOP_JUDGE_MOVE_METER: 3,
} as const;

export const REMAINING_DISTANCE_OPTIONS = {
  REACHED_JUDGE_DISTANCE_METER: 5,
} as const;

export const INTERVAL_DISTANCE_OPTIONS = {
  MIN_INTERVAL_DISTANCE_METER: 10,
} as const;
