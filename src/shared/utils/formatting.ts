// 초 → HH:MM:SS (항상 2자리 패딩)
export const formatTimeHHMMSSNumber = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// 초 → n시간 n분 (UI 요약용)
export const formatTimeHMText = (seconds: number): string => {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
};

// 초 → n분 (숫자 문자열)
export const formatTimeMinutesNumber = (seconds: number): string =>
  String(Math.round(seconds / 60));

// 초 → n시간 n분 n초 (자연어 텍스트)
export const formatTimeHMSText = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const hoursPart = hours > 0 ? `${hours}시간 ` : '';
  const minutesPart = minutes > 0 ? `${minutes}분 ` : '';
  const secondsPart = `${seconds}초`;

  return `${hoursPart}${minutesPart}${secondsPart}`.trim();
};

// Date → 오전/오후 H:MM
export const formatTimeHMWithPeriodText = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours < 12 ? '오전' : '오후';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${ampm} ${displayHour}:${displayMinutes}`;
};

// 기준 시간 ~ 도착 예정 시간 텍스트
export const formatTimeRangeText = (
  baseTime: Date,
  durationSeconds: number,
): string => {
  const arrival = new Date(baseTime.getTime() + durationSeconds * 1000);

  return `${formatTimeHMWithPeriodText(
    baseTime,
  )} - ${formatTimeHMWithPeriodText(arrival)}`;
};

// 시간 안내 문구 (로딩/에러 포함)
export const getTimeGuideText = (
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

  return formatTimeHMWithPeriodText(time);
};

// 거리 → m / km 자동 변환
export const formatDistanceAdaptiveText = (meters: number): string => {
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${parseFloat(km)}km`; // 불필요한 .0 제거
  }

  return `${Math.round(meters)}m`;
};

// 거리 안내 문구 (로딩/에러 포함)
export const getDistanceGuideText = (
  distance: number | null | undefined,
  options?: {
    loadingText?: string;
    errorText?: string;
  },
): string => {
  const { loadingText = '계산 중...', errorText = '거리 정보 없음' } =
    options || {};

  if (distance === null) return loadingText;
  if (distance === undefined) return errorText;

  return formatDistanceAdaptiveText(distance);
};

// 칼로리 → kcal 텍스트
export const formatCaloriesKcalText = (calories: number | null): string =>
  `${(calories ?? 0).toLocaleString()}kcal`;

// 경로 카테고리 텍스트 매핑
export const getRouteCategoryText = (category: string) => {
  if (category === 'bike_priority') return '자전거도로 우선';
  if (category === 'shortest') return '최단 경로';
  if (category === 'fastest') return '최소 시간';

  return '추천 경로';
};
