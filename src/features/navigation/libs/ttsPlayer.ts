// features/navigation/utils/ttsPlayer.ts
import {
  COOLDOWN_BY_KEY,
  DEFAULT_COOLDOWN_MS,
  TtsItem,
} from '@/features/navigation/model/navigation.constants';
import TrackPlayer, { Event, State } from 'react-native-track-player';

// =========================
// Queue state
// =========================
const queue: TtsItem[] = [];
let isConsuming = false;

// =========================
// Dedupe & cooldown policy
// =========================
const lastSpokenAtByCooldownKey = new Map<string, number>();

// =========================
// Helpers
// =========================
const now = () => Date.now();

/**
 * ✅ (1)(2) 핵심:
 * - 쿨다운/중복방지 기준을 "원본 key"가 아니라 "정책 key(prefix)"로 통일
 * - ex) tts-preview-12, tts-preview-13 => cooldownKey: "tts-preview"
 */
const getCooldownKey = (key: string) => {
  if (key.startsWith('tts-preview')) return 'tts-preview';
  if (key.startsWith('tts-turn')) return 'tts-turn';
  if (key.startsWith('tts-tap')) return 'tts-tap';
  return key;
};

const getCooldownMs = (key: string) => {
  const cooldownKey = getCooldownKey(key);
  return COOLDOWN_BY_KEY[cooldownKey] ?? DEFAULT_COOLDOWN_MS;
};

const isKeyAlreadyQueued = (key: string) => {
  const cooldownKey = getCooldownKey(key);
  return queue.some(item => getCooldownKey(item.key) === cooldownKey);
};

const isPlayingState = (s: State) => {
  return s === State.Playing || s === State.Buffering;
};

const getPlaybackStateSafe = async () => {
  try {
    const ps = await TrackPlayer.getPlaybackState();
    const st: State = (ps?.state ?? ps) as State;
    return st;
  } catch {
    return State.None;
  }
};

// =========================
// Public API
// =========================
/**
 * enqueueTts:
 * - key(prefix)별 쿨다운 체크(“재생 시작” 기준)
 * - 같은 prefix(key)가 이미 큐에 있으면 추가하지 않음(대기열 중복 방지)
 * - 재생 중이면 큐에 쌓고, 끝나면 자동 소비
 */
export const enqueueTts = (key: string, url: string, volume: number) => {
  const t = now();
  const cooldownKey = getCooldownKey(key);

  // ✅ (2) 같은 "정책 key(prefix)"가 이미 큐에 대기 중이면 또 넣지 않는다(난사 방지)
  if (isKeyAlreadyQueued(key)) return;

  // ✅ (1) prefix 기준 쿨다운(최근에 같은 prefix가 "재생 시작" 되었으면 컷)
  const lastSpokenAt = lastSpokenAtByCooldownKey.get(cooldownKey) ?? 0;
  const cooldown = getCooldownMs(key);

  if (t - lastSpokenAt < cooldown) return;

  queue.push({ key, url, volume, enqueuedAt: t });
  void consumeQueue();
};

/**
 * 강제로 큐 비우기(네비 종료/리셋 시 유용)
 */
export const clearTtsQueue = async () => {
  queue.length = 0;
  isConsuming = false;
  try {
    await TrackPlayer.reset();
  } catch {
    // ignore
  }
};

/**
 * App 진입 시 1회 등록
 * (registerPlaybackService랑 별개로, 이벤트 리스너는 여기서 붙임)
 */
export const registerTtsQueueHandler = () => {
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    void consumeQueue();
  });

  TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
    if (state === State.Stopped || state === State.Paused) {
      void consumeQueue();
    }
  });
};

// =========================
// Internal
// =========================
const consumeQueue = async () => {
  if (isConsuming) return;
  isConsuming = true;

  try {
    while (queue.length > 0) {
      const state = await getPlaybackStateSafe();

      // 이미 재생 중이면 이벤트가 끝나고 다시 호출될 것이므로 여기서 멈춤
      if (isPlayingState(state)) break;

      const item = queue.shift()!;
      // ✅ (1) "이 prefix(key)를 재생 시작했다"를 기록 (쿨다운 기준점)
      lastSpokenAtByCooldownKey.set(getCooldownKey(item.key), now());

      await TrackPlayer.reset();
      await TrackPlayer.setVolume(item.volume);
      await TrackPlayer.add({
        id: `${item.key}-${item.enqueuedAt}`,
        url: item.url,
        title: 'Navigation Instruction',
        artist: 'Ddarungi Map',
      });
      await TrackPlayer.play();

      // play() 호출 직후 loop가 한 번 더 돌면 state 갱신 전에 또 add할 수 있어서,
      // 다음 루프는 이벤트 기반으로 돌게 break.
      break;
    }
  } finally {
    isConsuming = false;
  }
};
