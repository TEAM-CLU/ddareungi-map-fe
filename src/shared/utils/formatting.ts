import { Segment } from '@/features/routing/model/routing.types';

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
