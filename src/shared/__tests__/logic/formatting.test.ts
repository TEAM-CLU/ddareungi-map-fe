import {
  formatCaloriesKcalText,
  formatDistanceAdaptiveText,
  formatTimeHHMMSSNumber,
  formatTimeHMSText,
  formatTimeHMText,
  formatTimeHMWithPeriodText,
  formatTimeMinutesNumber,
  formatTimeRangeText,
  getDistanceGuideText,
  getRouteCategoryText,
  getTimeGuideText,
} from '@/shared/utils/formatting';

describe('formatTimeHHMMSSNumber', () => {
  it('pads hours, minutes, and seconds to 2 digits', () => {
    expect(formatTimeHHMMSSNumber(0)).toBe('00:00:00');
    expect(formatTimeHHMMSSNumber(30)).toBe('00:00:30');
    expect(formatTimeHHMMSSNumber(3599)).toBe('00:59:59');
    expect(formatTimeHHMMSSNumber(3661)).toBe('01:01:01');
  });

  it('clamps negative values to zero', () => {
    expect(formatTimeHHMMSSNumber(-100)).toBe('00:00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTimeHHMMSSNumber(90.9)).toBe('00:01:30');
  });
});

describe('formatTimeHMText', () => {
  it('returns minutes for durations under an hour', () => {
    expect(formatTimeHMText(30)).toBe('1분');
    expect(formatTimeHMText(59)).toBe('1분');
    expect(formatTimeHMText(3540)).toBe('59분');
  });

  it('returns hours and minutes for durations of at least an hour', () => {
    expect(formatTimeHMText(3600)).toBe('1시간 0분');
    expect(formatTimeHMText(3660)).toBe('1시간 1분');
    expect(formatTimeHMText(7200)).toBe('2시간 0분');
    expect(formatTimeHMText(5430)).toBe('1시간 31분');
  });

  it('rounds seconds to the nearest minute', () => {
    expect(formatTimeHMText(89)).toBe('1분');
    expect(formatTimeHMText(90)).toBe('2분');
  });
});

describe('formatTimeMinutesNumber', () => {
  it('converts seconds to rounded minutes', () => {
    expect(formatTimeMinutesNumber(0)).toBe('0');
    expect(formatTimeMinutesNumber(60)).toBe('1');
    expect(formatTimeMinutesNumber(120)).toBe('2');
    expect(formatTimeMinutesNumber(3600)).toBe('60');
  });

  it('rounds fractional minutes', () => {
    expect(formatTimeMinutesNumber(89)).toBe('1');
    expect(formatTimeMinutesNumber(90)).toBe('2');
  });
});

describe('formatTimeHMSText', () => {
  it('formats seconds into natural Korean text', () => {
    expect(formatTimeHMSText(0)).toBe('0초');
    expect(formatTimeHMSText(30)).toBe('30초');
    expect(formatTimeHMSText(60)).toBe('1분 0초');
    expect(formatTimeHMSText(3599)).toBe('59분 59초');
    expect(formatTimeHMSText(3600)).toBe('1시간 0초');
    expect(formatTimeHMSText(3661)).toBe('1시간 1분 1초');
    expect(formatTimeHMSText(7325)).toBe('2시간 2분 5초');
  });

  it('omits the minutes part when it is zero', () => {
    expect(formatTimeHMSText(3605)).toBe('1시간 5초');
  });

  it('clamps negative values to zero', () => {
    expect(formatTimeHMSText(-100)).toBe('0초');
  });
});

describe('formatTimeHMWithPeriodText', () => {
  it('formats morning times with 오전', () => {
    const date = new Date(2026, 0, 11, 9, 5, 0);
    expect(formatTimeHMWithPeriodText(date)).toBe('오전 9:05');
  });

  it('formats afternoon times with 오후', () => {
    const date = new Date(2026, 0, 11, 15, 7, 0);
    expect(formatTimeHMWithPeriodText(date)).toBe('오후 3:07');
  });

  it('formats midnight and noon as 12시', () => {
    const midnight = new Date(2026, 0, 11, 0, 30, 0);
    const noon = new Date(2026, 0, 11, 12, 30, 0);
    expect(formatTimeHMWithPeriodText(midnight)).toBe('오전 12:30');
    expect(formatTimeHMWithPeriodText(noon)).toBe('오후 12:30');
  });
});

describe('formatTimeRangeText', () => {
  it('returns start and arrival times with AM/PM text', () => {
    const baseTime = new Date(2026, 0, 11, 9, 30, 0);
    expect(formatTimeRangeText(baseTime, 1800)).toBe('오전 9:30 - 오전 10:00');
  });

  it('handles the transition from morning to afternoon', () => {
    const baseTime = new Date(2026, 0, 11, 11, 45, 0);
    expect(formatTimeRangeText(baseTime, 1800)).toBe('오전 11:45 - 오후 12:15');
  });

  it('formats midnight and noon correctly', () => {
    const midnight = new Date(2026, 0, 11, 0, 0, 0);
    const noon = new Date(2026, 0, 11, 12, 0, 0);
    expect(formatTimeRangeText(midnight, 1800)).toBe('오전 12:00 - 오전 12:30');
    expect(formatTimeRangeText(noon, 1800)).toBe('오후 12:00 - 오후 12:30');
  });
});

describe('getTimeGuideText', () => {
  it('returns loading text for null', () => {
    expect(getTimeGuideText(null)).toBe('시간을 계산 중이에요');
  });

  it('returns error text for undefined', () => {
    expect(getTimeGuideText(undefined)).toBe('시간을 측정할 수 없어요');
  });

  it('formats dates using the AM/PM formatter', () => {
    const date = new Date(2026, 0, 11, 9, 5, 0);
    expect(getTimeGuideText(date)).toBe('오전 9:05');
  });

  it('returns custom loading and error text', () => {
    expect(getTimeGuideText(null, { loadingText: '로딩 중' })).toBe('로딩 중');
    expect(getTimeGuideText(undefined, { errorText: '에러 발생' })).toBe(
      '에러 발생',
    );
  });
});

describe('formatDistanceAdaptiveText', () => {
  it('returns rounded meters for values under 1000', () => {
    expect(formatDistanceAdaptiveText(0)).toBe('0m');
    expect(formatDistanceAdaptiveText(500.4)).toBe('500m');
    expect(formatDistanceAdaptiveText(500.6)).toBe('501m');
    expect(formatDistanceAdaptiveText(999.6)).toBe('1000m');
  });

  it('returns kilometers for values of at least 1000', () => {
    expect(formatDistanceAdaptiveText(1000)).toBe('1km');
    expect(formatDistanceAdaptiveText(1500)).toBe('1.5km');
    expect(formatDistanceAdaptiveText(2345)).toBe('2.3km');
    expect(formatDistanceAdaptiveText(2000)).toBe('2km');
  });
});

describe('getDistanceGuideText', () => {
  it('returns loading text for null', () => {
    expect(getDistanceGuideText(null)).toBe('계산 중...');
  });

  it('returns error text for undefined', () => {
    expect(getDistanceGuideText(undefined)).toBe('거리 정보 없음');
  });

  it('formats distance using the adaptive formatter', () => {
    expect(getDistanceGuideText(800)).toBe('800m');
    expect(getDistanceGuideText(1500)).toBe('1.5km');
  });

  it('returns custom loading and error text', () => {
    expect(
      getDistanceGuideText(null, { loadingText: '계산 중', errorText: '에러' }),
    ).toBe('계산 중');
    expect(
      getDistanceGuideText(undefined, {
        loadingText: '계산 중',
        errorText: '에러',
      }),
    ).toBe('에러');
  });
});

describe('formatCaloriesKcalText', () => {
  it('adds thousands separators and appends kcal', () => {
    expect(formatCaloriesKcalText(100)).toBe('100kcal');
    expect(formatCaloriesKcalText(1000)).toBe('1,000kcal');
    expect(formatCaloriesKcalText(1234567)).toBe('1,234,567kcal');
  });

  it('treats null as zero', () => {
    expect(formatCaloriesKcalText(null)).toBe('0kcal');
  });
});

describe('getRouteCategoryText', () => {
  it('maps known categories', () => {
    expect(getRouteCategoryText('bike_priority')).toBe('자전거도로 우선');
    expect(getRouteCategoryText('shortest')).toBe('최단 경로');
    expect(getRouteCategoryText('fastest')).toBe('최소 시간');
  });

  it('falls back to the default category', () => {
    expect(getRouteCategoryText('unknown')).toBe('추천 경로');
    expect(getRouteCategoryText('')).toBe('추천 경로');
  });
});
