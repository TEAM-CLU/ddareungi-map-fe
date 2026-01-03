import {
  getTimeText,
  getDistanceText,
  formatDistance,
  formatCalories,
} from '@/shared/utils/formatting';

describe('getTimeText 시간 포맷 함수', () => {
  it('null 입력시 로딩 문구 반환', () => {
    expect(getTimeText(null)).toBe('시간을 계산 중이에요');
  });
  it('undefined 입력시 에러 문구 반환', () => {
    expect(getTimeText(undefined)).toBe('시간을 측정할 수 없어요');
  });
  it('오전(AM) 시간 포맷 반환', () => {
    const date = new Date('2023-01-01T09:05:00');
    expect(getTimeText(date)).toBe('09:05AM');
  });
  it('오후(PM) 시간 포맷 반환', () => {
    const date = new Date('2023-01-01T15:07:00');
    expect(getTimeText(date)).toBe('03:07PM');
  });
  it('커스텀 로딩/에러 문구 반환', () => {
    expect(getTimeText(null, { loadingText: '로딩', errorText: '에러' })).toBe(
      '로딩',
    );
    expect(
      getTimeText(undefined, { loadingText: '로딩', errorText: '에러' }),
    ).toBe('에러');
  });
});

describe('getDistanceText 거리 포맷 함수', () => {
  it('null 입력시 로딩 문구 반환', () => {
    expect(getDistanceText(null)).toBe('거리를 계산 중이에요');
  });
  it('undefined 입력시 에러 문구 반환', () => {
    expect(getDistanceText(undefined)).toBe('거리를 찾을 수 없어요');
  });
  it('1000m 미만은 m 단위 반환', () => {
    expect(getDistanceText(800)).toBe('800m');
    expect(getDistanceText(0)).toBe('0m');
  });
  it('1000m 이상은 km 단위 반환', () => {
    expect(getDistanceText(1500)).toBe('1.5km');
    expect(getDistanceText(2000)).toBe('2.0km');
  });
  it('커스텀 로딩/에러 문구 반환', () => {
    expect(
      getDistanceText(null, { loadingText: '로딩', errorText: '에러' }),
    ).toBe('로딩');
    expect(
      getDistanceText(undefined, { loadingText: '로딩', errorText: '에러' }),
    ).toBe('에러');
  });
});

describe('formatDistance(km 변환) 함수', () => {
  it('정수 km로 포맷', () => {
    expect(formatDistance(2000)).toBe('2km');
    expect(formatDistance(10000)).toBe('10km');
  });
  it('소수점 km로 포맷', () => {
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(1234)).toBe('1.2km');
  });
});

describe('formatCalories 칼로리 포맷 함수', () => {
  it('콤마+단위(kcal)로 포맷', () => {
    expect(formatCalories(1234)).toBe('1,234kcal');
    expect(formatCalories(1000000)).toBe('1,000,000kcal');
  });
  it('null 입력시 0kcal 반환', () => {
    expect(formatCalories(null)).toBe('0kcal');
  });
});
