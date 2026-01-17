import { Segment } from '@/features/routing/model/routing.types';

// 시간 포맷팅 (초 → HH:MM:SS)
export const formatTimeHHMMSS = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// 시간 포맷팅 (초 → n시간 n분)
export const formatTime = (seconds: number): string => {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
};

// 시간 포맷팅 (초 → n분)
export const formatMinutes = (seconds: number): string =>
  String(Math.round(seconds / 60));

// 시간 포맷팅 (초 -> n시간 n분 n초)
export const formatTimeWithSeconds = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const hoursPart = hours > 0 ? `${hours}시간 ` : '';
  const minutesPart = minutes > 0 ? `${minutes}분 ` : '';
  const secondsPart = `${seconds}초`;

  return `${hoursPart}${minutesPart}${secondsPart}`.trim();
};
// 시간대 포맷팅 함수 (baseTime 기준 ~ 도착 예정 시간)
export const formatTimeRange = (
  baseTime: Date,
  durationSeconds: number,
): string => {
  const arrival = new Date(baseTime.getTime() + durationSeconds * 1000);

  const formatHourMinute = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours % 12 || 12;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  return `${formatHourMinute(baseTime)} - ${formatHourMinute(arrival)}`;
};

// 시간 텍스트 계산 함수
export const getTimeText = (
  time: Date | null | undefined,
  options?: {
    loadingText?: string;
    errorText?: string;
  },
): string => {
  const loading = options?.loadingText || '시간을 계산 중이에요';
  const error = options?.errorText || '시간을 측정할 수 없어요';

  if (time === null) return loading;
  if (time === undefined) return error;

  let hours = time.getHours();
  const minutes = time.getMinutes();

  const isPM = hours >= 12;
  const period = isPM ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const hourText = String(hours).padStart(2, '0');
  const minuteText = String(minutes).padStart(2, '0');

  return `${hourText}:${minuteText}${period}`;
};

// 태그 최대 3개로 제한
export const clampTags = (tags: string[]) =>
  tags
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 3);

// 거리 포맷팅 (미터 → km)
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    // 1. km 변환 후 소수점 첫째 자리까지 반올림
    const km = (meters / 1000).toFixed(1);
    // 2. "2.0" -> 2 처럼 불필요한 소수점 0을 자동으로 제거
    return `${parseFloat(km)}km`;
  }
  // 3. 1000m 미만은 정수로 반올림
  return `${Math.round(meters)}m`;
};

// 거리 포맷팅 (1000m 이상일 때 km, 미만일 때 m)
export const formatDistanceAdaptive = (distanceMeter: number): string => {
  return distanceMeter >= 1000
    ? `${(distanceMeter / 1000).toFixed(1)}km`
    : `${Math.round(distanceMeter)}m`;
};

// 거리 텍스트 계산 함수
export const getDistanceText = (
  distance: number | null | undefined,
  options?: {
    loadingText?: string;
    errorText?: string;
  },
): string => {
  const { loadingText = '계산 중...', errorText = '거리 정보 없음' } =
    options || {};

  if (distance === null) return loadingText; // 로딩 중
  if (distance === undefined) return errorText; // 계산 실패
  return formatDistance(distance);
};

// 칼로리 포맷팅 (3자리 콤마)
export const formatCalories = (calories: number | null): string => {
  return `${(calories ?? 0).toLocaleString()}kcal`;
};

// 도보 시간 계산 (segments에서 walking 구간 찾기)
export const calculateWalkingTime = (segments: Segment[]): number => {
  return segments
    .filter(seg => seg.type === 'walking')
    .reduce((total, seg) => total + seg.summary.time, 0);
};

// 경로 카테고리 매칭
export const getCategoryText = (category: string) => {
  if (category === 'bike_priority') return '자전거도로 우선';
  if (category === 'shortest') return '최단 경로';
  if (category === 'fastest') return '최소 시간';
  return '추천 경로';
};
