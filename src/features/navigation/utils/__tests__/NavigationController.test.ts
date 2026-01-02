import {
  calculateRemainingDistanceMeter,
  calculateTraveledDistanceMeter,
  returnAccurateSpeedMeter,
  calculateEta,
} from '@/features/navigation/utils/NavigationController';

describe('NavigationController 핵심 로직 검증', () => {
  // 현실적인 서울 근처 좌표
  const coord = (lat: number, lng: number) => ({ lat, lng });
  // 단순 좌표 생성용 (returnAccurateSpeedMeter 등에서 사용)
  const dummyCoord = (lat: number, lng: number) => ({ lat, lng });
  // IntervalPathData[]: 실제 polyline segment별 좌표
  const pathDataListByInterval = [
    {
      intervalIndex: 0,
      interval: [0, 2] as [number, number],
      coordinateList: [
        coord(37.5665, 126.978), // 서울시청
        coord(37.5666, 126.9785),
        coord(37.5667, 126.979),
      ],
    },
    {
      intervalIndex: 1,
      interval: [3, 4] as [number, number],
      coordinateList: [coord(37.5668, 126.9795), coord(37.5669, 126.98)],
    },
  ];

  // NavigationInstruction[]: 실제 네비게이션 지시
  const instructionList = [
    {
      distance: 70, // 실제 polyline 거리(m)와 유사하게
      time: 60,
      text: 'Go straight',
      sign: 0,
      interval: [0, 2] as [number, number],
      nextTurnCoordinate: coord(37.5667, 126.979),
    },
    {
      distance: 50,
      time: 40,
      text: 'Turn right',
      sign: 1,
      interval: [3, 4] as [number, number],
      nextTurnCoordinate: coord(37.5669, 126.98),
    },
  ];

  it('calculateRemainingDistanceMeter: 내 위치가 첫 인터벌 시작점일 때 남은 거리', () => {
    const myPosition = coord(37.5665, 126.978); // 시작점
    const result = calculateRemainingDistanceMeter(
      myPosition,
      pathDataListByInterval,
      0,
      instructionList,
    );
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(200); // 실제 거리 합산값 기준
  });

  it('calculateTraveledDistanceMeter: 내 위치가 두 번째 인터벌 끝점일 때 소요 거리', () => {
    const myPosition = coord(37.5669, 126.98); // 마지막 점
    const result = calculateTraveledDistanceMeter(
      myPosition,
      pathDataListByInterval,
      1,
      instructionList,
    );
    expect(result).toBeGreaterThanOrEqual(70);
    expect(result).toBeLessThanOrEqual(200);
  });

  it('returnAccurateSpeedMeter: OS 속도와 accuracy가 모두 있을 때 EMA 계산', () => {
    const prev = {
      coordinate: dummyCoord(0, 0),
      timestemp: 0,
      accuracy: 10,
      osSpeed: 2,
    };
    const curr = {
      coordinate: dummyCoord(0, 1),
      timestemp: 1000,
      accuracy: 10,
      osSpeed: 4,
    };
    const result = returnAccurateSpeedMeter(prev, curr, 2);
    expect(result).toBeGreaterThan(2);
    expect(result).toBeLessThanOrEqual(4);
  });

  it('returnAccurateSpeedMeter: OS 속도와 accuracy가 없는 경우 직접 거리/시간 계산', () => {
    const prev = {
      coordinate: dummyCoord(0, 0),
      timestemp: 0,
    };
    const curr = {
      coordinate: dummyCoord(0, 0.001),
      timestemp: 1000,
    };
    const result = returnAccurateSpeedMeter(prev, curr, undefined);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(200);
  });

  it('calculateEta: 남은 거리와 속도로 ETA 계산', () => {
    const eta = calculateEta(1000, 2); // 1000m 남았고 2m/s 속도
    expect(eta).toBeInstanceOf(Date);
    const now = Date.now();
    expect(eta!.getTime()).toBeGreaterThan(now);
  });
});
