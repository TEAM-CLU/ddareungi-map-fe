import {
  getTimeText,
  getDistanceText,
  formatDistance,
  formatDistanceAdaptive,
  formatCalories,
  formatTimeHHMMSS,
  formatTime,
  formatMinutes,
  formatTimeWithSeconds,
  formatTimeRange,
  clampTags,
  getCategoryText,
  calculateWalkingTime,
} from '@/shared/utils/formatting';

describe('formatTimeHHMMSS', () => {
  it('0초는 00:00:00으로 포맷된다', () => {
    expect(formatTimeHHMMSS(0)).toBe('00:00:00');
  });

  it('1분 미만은 초만 표시된다', () => {
    expect(formatTimeHHMMSS(30)).toBe('00:00:30');
    expect(formatTimeHHMMSS(59)).toBe('00:00:59');
  });

  it('1시간 미만은 분과 초로 표시된다', () => {
    expect(formatTimeHHMMSS(90)).toBe('00:01:30');
    expect(formatTimeHHMMSS(3599)).toBe('00:59:59');
  });

  it('1시간 이상은 시:분:초로 표시된다', () => {
    expect(formatTimeHHMMSS(3600)).toBe('01:00:00');
    expect(formatTimeHHMMSS(3661)).toBe('01:01:01');
    expect(formatTimeHHMMSS(7325)).toBe('02:02:05');
  });

  it('음수 입력은 00:00:00으로 처리된다', () => {
    expect(formatTimeHHMMSS(-100)).toBe('00:00:00');
  });

  it('소수점 입력은 내림 처리된다', () => {
    expect(formatTimeHHMMSS(90.9)).toBe('00:01:30');
  });
});

describe('formatTime', () => {
  it('1분 미만은 1분으로 표시된다', () => {
    expect(formatTime(30)).toBe('1분');
    expect(formatTime(59)).toBe('1분');
  });

  it('1시간 미만은 분으로만 표시된다', () => {
    expect(formatTime(60)).toBe('1분');
    expect(formatTime(300)).toBe('5분');
    expect(formatTime(3540)).toBe('59분');
  });

  it('1시간 이상은 시간과 분으로 표시된다', () => {
    expect(formatTime(3600)).toBe('1시간 0분');
    expect(formatTime(3660)).toBe('1시간 1분');
    expect(formatTime(7200)).toBe('2시간 0분');
    expect(formatTime(5430)).toBe('1시간 31분');
  });

  it('초가 반올림되어 분으로 계산된다', () => {
    expect(formatTime(89)).toBe('1분');
    expect(formatTime(90)).toBe('2분');
  });
});

describe('formatMinutes', () => {
  it('초를 분으로 변환하여 문자열로 반환한다', () => {
    expect(formatMinutes(0)).toBe('0');
    expect(formatMinutes(60)).toBe('1');
    expect(formatMinutes(120)).toBe('2');
    expect(formatMinutes(3600)).toBe('60');
  });

  it('초가 반올림되어 분으로 계산된다', () => {
    expect(formatMinutes(89)).toBe('1');
    expect(formatMinutes(90)).toBe('2');
  });
});

describe('formatTimeWithSeconds', () => {
  it('1분 미만은 초만 표시된다', () => {
    expect(formatTimeWithSeconds(0)).toBe('0초');
    expect(formatTimeWithSeconds(30)).toBe('30초');
    expect(formatTimeWithSeconds(59)).toBe('59초');
  });

  it('1시간 미만은 분과 초로 표시된다', () => {
    expect(formatTimeWithSeconds(60)).toBe('1분 0초');
    expect(formatTimeWithSeconds(90)).toBe('1분 30초');
    expect(formatTimeWithSeconds(3599)).toBe('59분 59초');
  });

  it('1시간 이상은 시간, 분, 초로 표시된다', () => {
    expect(formatTimeWithSeconds(3600)).toBe('1시간 0초');
    expect(formatTimeWithSeconds(3661)).toBe('1시간 1분 1초');
    expect(formatTimeWithSeconds(7325)).toBe('2시간 2분 5초');
  });

  it('0분인 경우 분이 생략된다', () => {
    expect(formatTimeWithSeconds(3605)).toBe('1시간 5초');
  });

  it('음수 입력은 0초로 처리된다', () => {
    expect(formatTimeWithSeconds(-100)).toBe('0초');
  });
});

describe('formatTimeRange', () => {
  it('출발 시간과 도착 시간을 오전/오후 형식으로 반환한다', () => {
    const baseTime = new Date('2026-01-11T09:30:00');
    expect(formatTimeRange(baseTime, 1800)).toBe('오전 9:30 - 오전 10:00');
  });

  it('오전에서 오후로 넘어가는 시간대를 처리한다', () => {
    const baseTime = new Date('2026-01-11T11:45:00');
    expect(formatTimeRange(baseTime, 1800)).toBe('오전 11:45 - 오후 12:15');
  });

  it('자정을 12시로 표시한다', () => {
    const baseTime = new Date('2026-01-11T00:00:00');
    expect(formatTimeRange(baseTime, 1800)).toBe('오전 12:00 - 오전 12:30');
  });

  it('정오를 12시로 표시한다', () => {
    const baseTime = new Date('2026-01-11T12:00:00');
    expect(formatTimeRange(baseTime, 1800)).toBe('오후 12:00 - 오후 12:30');
  });
});

describe('getTimeText', () => {
  it('null 입력시 로딩 문구를 반환한다', () => {
    expect(getTimeText(null)).toBe('시간을 계산 중이에요');
  });

  it('undefined 입력시 에러 문구를 반환한다', () => {
    expect(getTimeText(undefined)).toBe('시간을 측정할 수 없어요');
  });

  it('오전 시간을 AM 포맷으로 반환한다', () => {
    const date = new Date('2026-01-11T09:05:00');
    expect(getTimeText(date)).toBe('09:05AM');
  });

  it('오후 시간을 PM 포맷으로 반환한다', () => {
    const date = new Date('2026-01-11T15:07:00');
    expect(getTimeText(date)).toBe('03:07PM');
  });

  it('자정을 12시 AM으로 반환한다', () => {
    const date = new Date('2026-01-11T00:30:00');
    expect(getTimeText(date)).toBe('12:30AM');
  });

  it('정오를 12시 PM으로 반환한다', () => {
    const date = new Date('2026-01-11T12:30:00');
    expect(getTimeText(date)).toBe('12:30PM');
  });

  it('커스텀 로딩/에러 문구를 반환한다', () => {
    expect(getTimeText(null, { loadingText: '로딩 중' })).toBe('로딩 중');
    expect(getTimeText(undefined, { errorText: '에러 발생' })).toBe(
      '에러 발생',
    );
  });
});

describe('clampTags', () => {
  it('빈 배열은 빈 배열을 반환한다', () => {
    expect(clampTags([])).toEqual([]);
  });

  it('3개 이하의 태그는 그대로 반환한다', () => {
    expect(clampTags(['태그1'])).toEqual(['태그1']);
    expect(clampTags(['태그1', '태그2'])).toEqual(['태그1', '태그2']);
    expect(clampTags(['태그1', '태그2', '태그3'])).toEqual([
      '태그1',
      '태그2',
      '태그3',
    ]);
  });

  it('3개를 초과하는 태그는 앞의 3개만 반환한다', () => {
    expect(clampTags(['태그1', '태그2', '태그3', '태그4'])).toEqual([
      '태그1',
      '태그2',
      '태그3',
    ]);
    expect(clampTags(['a', 'b', 'c', 'd', 'e'])).toEqual(['a', 'b', 'c']);
  });

  it('공백이 포함된 태그는 trim 처리된다', () => {
    expect(clampTags(['  태그1  ', ' 태그2 '])).toEqual(['태그1', '태그2']);
  });

  it('빈 문자열과 공백만 있는 태그는 제거된다', () => {
    expect(clampTags(['태그1', '', '태그2', '   ', '태그3'])).toEqual([
      '태그1',
      '태그2',
      '태그3',
    ]);
  });

  it('빈 문자열 제거 후 3개를 초과하면 앞의 3개만 반환한다', () => {
    expect(clampTags(['태그1', '', '태그2', '태그3', '  ', '태그4'])).toEqual([
      '태그1',
      '태그2',
      '태그3',
    ]);
  });
});

describe('formatDistance', () => {
  it('정수 km는 소수점 없이 표시된다', () => {
    expect(formatDistance(2000)).toBe('2km');
    expect(formatDistance(10000)).toBe('10km');
  });

  it('소수 km는 기본 1자리로 표시된다', () => {
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(2345)).toBe('2.3km');
  });

  it('소수점 자릿수를 지정할 수 있다', () => {
    expect(formatDistance(1234, 2)).toBe('1.23km');
    expect(formatDistance(5678, 0)).toBe('6km');
  });

  it('1km 미만도 km 단위로 표시된다', () => {
    expect(formatDistance(500)).toBe('0.5km');
    expect(formatDistance(100, 2)).toBe('0.10km');
  });
});

describe('formatDistanceAdaptive', () => {
  it('1000m 미만은 m 단위로 표시된다', () => {
    expect(formatDistanceAdaptive(0)).toBe('0m');
    expect(formatDistanceAdaptive(500)).toBe('500m');
    expect(formatDistanceAdaptive(999)).toBe('999m');
  });

  it('1000m 이상은 km 단위로 표시된다', () => {
    expect(formatDistanceAdaptive(1000)).toBe('1.0km');
    expect(formatDistanceAdaptive(1500)).toBe('1.5km');
    expect(formatDistanceAdaptive(2345)).toBe('2.3km');
  });

  it('소수점은 반올림되어 m 단위로 표시된다', () => {
    expect(formatDistanceAdaptive(500.4)).toBe('500m');
    expect(formatDistanceAdaptive(500.6)).toBe('501m');
  });
});

describe('getDistanceText', () => {
  it('null 입력시 로딩 문구를 반환한다', () => {
    expect(getDistanceText(null)).toBe('거리를 계산 중이에요');
  });

  it('undefined 입력시 에러 문구를 반환한다', () => {
    expect(getDistanceText(undefined)).toBe('거리를 찾을 수 없어요');
  });

  it('1000m 미만은 m 단위로 반환한다', () => {
    expect(getDistanceText(800)).toBe('800m');
    expect(getDistanceText(0)).toBe('0m');
  });

  it('1000m 이상은 km 단위로 반환한다', () => {
    expect(getDistanceText(1500)).toBe('1.5km');
    expect(getDistanceText(2000)).toBe('2.0km');
  });

  it('커스텀 로딩/에러 문구를 반환한다', () => {
    expect(
      getDistanceText(null, { loadingText: '계산 중', errorText: '에러' }),
    ).toBe('계산 중');
    expect(
      getDistanceText(undefined, { loadingText: '계산 중', errorText: '에러' }),
    ).toBe('에러');
  });
});

describe('formatCalories', () => {
  it('천의 자리부터 콤마가 추가된다', () => {
    expect(formatCalories(100)).toBe('100kcal');
    expect(formatCalories(1000)).toBe('1,000kcal');
    expect(formatCalories(1234)).toBe('1,234kcal');
  });

  it('백만 단위도 콤마로 구분된다', () => {
    expect(formatCalories(1000000)).toBe('1,000,000kcal');
    expect(formatCalories(1234567)).toBe('1,234,567kcal');
  });

  it('null 입력은 0kcal로 반환된다', () => {
    expect(formatCalories(null)).toBe('0kcal');
  });

  it('0 입력은 0kcal로 반환된다', () => {
    expect(formatCalories(0)).toBe('0kcal');
  });
});

describe('getCategoryText', () => {
  it('자전거도로 우선 카테고리를 반환한다', () => {
    expect(getCategoryText('bike_priority')).toBe('자전거도로 우선');
  });

  it('최단 경로 카테고리를 반환한다', () => {
    expect(getCategoryText('shortest')).toBe('최단 경로');
  });

  it('최소 시간 카테고리를 반환한다', () => {
    expect(getCategoryText('fastest')).toBe('최소 시간');
  });

  it('알 수 없는 카테고리는 추천 경로로 반환한다', () => {
    expect(getCategoryText('unknown')).toBe('추천 경로');
    expect(getCategoryText('')).toBe('추천 경로');
    expect(getCategoryText('custom')).toBe('추천 경로');
  });
});

describe('calculateWalkingTime', () => {
  it('빈 세그먼트 배열은 0을 반환한다', () => {
    expect(calculateWalkingTime([])).toBe(0);
  });

  it('walking 타입의 세그먼트 시간만 합산한다', () => {
    const segments = [
      { type: 'walking', summary: { time: 100 } },
      { type: 'biking', summary: { time: 200 } },
      { type: 'walking', summary: { time: 150 } },
    ] as any;

    expect(calculateWalkingTime(segments)).toBe(250);
  });

  it('walking 타입이 없으면 0을 반환한다', () => {
    const segments = [
      { type: 'biking', summary: { time: 100 } },
      { type: 'biking', summary: { time: 200 } },
    ] as any;

    expect(calculateWalkingTime(segments)).toBe(0);
  });

  it('모든 세그먼트가 walking이면 모든 시간을 합산한다', () => {
    const segments = [
      { type: 'walking', summary: { time: 100 } },
      { type: 'walking', summary: { time: 200 } },
      { type: 'walking', summary: { time: 300 } },
    ] as any;

    expect(calculateWalkingTime(segments)).toBe(600);
  });
});
