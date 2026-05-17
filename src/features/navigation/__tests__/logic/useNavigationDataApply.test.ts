import { normalizeNavigationDataByWalkingPolicy } from '@/features/navigation/hooks/useNavigationDataApply';

describe('normalizeNavigationDataByWalkingPolicy', () => {
  it('walkingPolicy가 all이면 원본 데이터를 유지한다', () => {
    const original = {
      coordinates: [
        [126.97, 37.56],
        [126.971, 37.561],
      ] as [number, number][],
      instructions: [
        {
          distance: 100,
          time: 20,
          text: '직진',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: { lat: 37.561, lng: 126.971 },
          ttsUrl: 'https://example.com/tts/0',
        },
      ],
    };

    const result = normalizeNavigationDataByWalkingPolicy(
      original,
      'all',
      { lat: 37.561, lng: 126.971 },
    );

    expect(result).toBe(original);
  });

  it('only-end에서 시작 대여소 이전 구간을 절단하고 interval을 재인덱싱한다', () => {
    const data = {
      coordinates: [
        [127.0, 37.0], // 0
        [127.001, 37.001], // 1
        [127.002, 37.002], // 2 <- startStation 근처
        [127.003, 37.003], // 3
        [127.004, 37.004], // 4
      ] as [number, number][],
      instructions: [
        {
          distance: 200,
          time: 50,
          text: '시작 구간',
          sign: 0,
          interval: [0, 2] as [number, number],
          nextTurnCoordinate: { lat: 37.002, lng: 127.002 },
          ttsUrl: 'https://example.com/tts/0',
        },
        {
          distance: 300,
          time: 70,
          text: '자전거 구간',
          sign: 1,
          interval: [3, 4] as [number, number],
          nextTurnCoordinate: { lat: 37.004, lng: 127.004 },
          ttsUrl: 'https://example.com/tts/1',
        },
      ],
    };

    const result = normalizeNavigationDataByWalkingPolicy(data, 'only-end', {
      lat: 37.002,
      lng: 127.002,
    });

    expect(result.coordinates).toEqual([
      [127.002, 37.002],
      [127.003, 37.003],
      [127.004, 37.004],
    ]);
    expect(result.instructions).toHaveLength(2);
    expect(result.instructions[0].interval).toEqual([0, 0]);
    expect(result.instructions[1].interval).toEqual([1, 2]);
  });

  it('only-end에서 시작점 이전 instruction은 제거된다', () => {
    const data = {
      coordinates: [
        [127.0, 37.0], // 0
        [127.001, 37.001], // 1
        [127.002, 37.002], // 2 <- trim start
        [127.003, 37.003], // 3
      ] as [number, number][],
      instructions: [
        {
          distance: 80,
          time: 20,
          text: '도보 전용',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: { lat: 37.001, lng: 127.001 },
          ttsUrl: 'https://example.com/tts/a',
        },
        {
          distance: 120,
          time: 30,
          text: '자전거 시작',
          sign: 1,
          interval: [2, 3] as [number, number],
          nextTurnCoordinate: { lat: 37.003, lng: 127.003 },
          ttsUrl: 'https://example.com/tts/b',
        },
      ],
    };

    const result = normalizeNavigationDataByWalkingPolicy(data, 'only-end', {
      lat: 37.002,
      lng: 127.002,
    });

    expect(result.coordinates).toEqual([
      [127.002, 37.002],
      [127.003, 37.003],
    ]);
    expect(result.instructions).toHaveLength(1);
    expect(result.instructions[0].text).toBe('자전거 시작');
    expect(result.instructions[0].interval).toEqual([0, 1]);
  });
});
