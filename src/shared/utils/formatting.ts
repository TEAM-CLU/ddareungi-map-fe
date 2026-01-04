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

// 거리 포맷팅 (미터 → km)
export const formatDistance = (meters: number): string => {
  const distanceInKm = meters / 1000;
  return distanceInKm % 1 === 0
    ? `${distanceInKm.toFixed(0)}km`
    : `${distanceInKm.toFixed(1)}km`;
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
  const loading = options?.loadingText || '거리를 계산 중이에요';
  const error = options?.errorText || '거리를 찾을 수 없어요';

  if (distance === null) return loading; // 로딩 중
  if (distance === undefined) return error; // 계산 실패
  return formatDistanceAdaptive(distance);
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
