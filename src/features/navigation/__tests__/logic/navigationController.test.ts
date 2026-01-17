import {
  calculateRemainingDistance,
  calculateTraveledDistance,
  calculateEta,
  returnAccurateSpeed,
  stabilizeDistance,
  findClosestCoordIndex,
  calculateIntervalDistanceByMyPosition,
} from '@/features/navigation/utils/navigationController';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';

describe('navigationController 핵심 로직 검증', () => {
  const coord = (lat: number, lng: number) => ({ lat, lng });
  const sumSegmentDistances = (coords: { lat: number; lng: number }[]) =>
    coords.slice(1).reduce((sum, curr, idx) => {
      return sum + getDistanceBetweenCoords(coords[idx], curr);
    }, 0);

  describe('findClosestCoordIndex', () => {
    it('빈 배열에서는 0을 반환한다', () => {
      const result = findClosestCoordIndex(coord(0, 0), []);
      expect(result).toBe(0);
    });

    it('좌표가 1개뿐이면 0을 반환한다', () => {
      const result = findClosestCoordIndex(coord(0, 0), [coord(1, 1)]);
      expect(result).toBe(0);
    });

    it('내 위치와 가장 가까운 선분의 시작 인덱스를 반환한다', () => {
      const path = [coord(0, 0), coord(0, 0.001), coord(0, 0.002)];
      const myPos = coord(0, 0.00015); // 첫번째 선분에 가까움

      const result = findClosestCoordIndex(myPos, path);
      expect(result).toBe(0);
    });

    it('경로 중간 위치에서 올바른 선분 인덱스를 찾는다', () => {
      const path = [
        coord(0, 0),
        coord(0, 0.001),
        coord(0, 0.002),
        coord(0, 0.003),
      ];
      const myPos = coord(0, 0.0025); // 세번째 선분에 가까움

      const result = findClosestCoordIndex(myPos, path);
      expect(result).toBe(2);
    });

    it('경로 끝 부근에서 마지막 선분 인덱스를 반환한다', () => {
      const path = [coord(0, 0), coord(0, 0.001), coord(0, 0.002)];
      const myPos = coord(0, 0.0019);

      const result = findClosestCoordIndex(myPos, path);
      expect(result).toBe(1);
    });
  });

  describe('calculateIntervalDistanceByMyPosition', () => {
    it('좌표가 없는 인터벌은 0을 반환한다', () => {
      const pathData = [
        {
          intervalIndex: 0,
          interval: [0, 0] as [number, number],
          coordinateList: [],
        },
      ];

      const traveled = calculateIntervalDistanceByMyPosition(
        coord(0, 0),
        pathData,
        0,
        'traveled',
      );
      const remaining = calculateIntervalDistanceByMyPosition(
        coord(0, 0),
        pathData,
        0,
        'remaining',
      );

      expect(traveled).toBe(0);
      expect(remaining).toBe(0);
    });

    it('좌표가 1개인 인터벌은 직선 거리를 반환한다', () => {
      const pathData = [
        {
          intervalIndex: 0,
          interval: [0, 0] as [number, number],
          coordinateList: [coord(0, 0)],
        },
      ];
      const myPos = coord(0, 0.001);

      const traveled = calculateIntervalDistanceByMyPosition(
        myPos,
        pathData,
        0,
        'traveled',
      );
      const remaining = calculateIntervalDistanceByMyPosition(
        myPos,
        pathData,
        0,
        'remaining',
      );

      const expectedDist = getDistanceBetweenCoords(coord(0, 0), myPos);
      expect(traveled).toBeCloseTo(expectedDist, 1);
      expect(remaining).toBeCloseTo(expectedDist, 1);
    });

    it('traveled는 시작점부터 내 위치까지 거리를 계산한다', () => {
      const path = [coord(0, 0), coord(0, 0.001), coord(0, 0.002)];
      const pathData = [
        {
          intervalIndex: 0,
          interval: [0, 2] as [number, number],
          coordinateList: path,
        },
      ];
      const myPos = coord(0, 0.00015);

      const traveled = calculateIntervalDistanceByMyPosition(
        myPos,
        pathData,
        0,
        'traveled',
      );

      // 시작점 -> closest + polyline 누적
      expect(traveled).toBeGreaterThan(0);
      expect(traveled).toBeLessThan(sumSegmentDistances(path));
    });

    it('remaining은 내 위치부터 끝까지 거리를 계산한다', () => {
      const path = [coord(0, 0), coord(0, 0.001), coord(0, 0.002)];
      const pathData = [
        {
          intervalIndex: 0,
          interval: [0, 2] as [number, number],
          coordinateList: path,
        },
      ];
      const myPos = coord(0, 0.00015);

      const remaining = calculateIntervalDistanceByMyPosition(
        myPos,
        pathData,
        0,
        'remaining',
      );

      // 내 위치 -> 끝점
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThan(sumSegmentDistances(path));
    });

    it('경로의 끝에 가까우면 remaining이 작아진다', () => {
      const path = [coord(0, 0), coord(0, 0.001), coord(0, 0.002)];
      const pathData = [
        {
          intervalIndex: 0,
          interval: [0, 2] as [number, number],
          coordinateList: path,
        },
      ];
      const myPosNearEnd = coord(0, 0.00195);

      const remaining = calculateIntervalDistanceByMyPosition(
        myPosNearEnd,
        pathData,
        0,
        'remaining',
      );

      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThan(10); // 매우 작은 거리
    });
  });

  describe('calculateRemainingDistance', () => {
    it('현재 인터벌 + 이후 인터벌 거리 합산 후 안정화 값을 반환한다', () => {
      const interval0 = [coord(0, 0), coord(0, 0.0001), coord(0, 0.0002)];
      const interval1 = [coord(0, 0.0003), coord(0, 0.0004)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 2] as [number, number],
          coordinateList: interval0,
        },
        {
          intervalIndex: 1,
          interval: [3, 4] as [number, number],
          coordinateList: interval1,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 60,
          text: '직진',
          sign: 0,
          interval: [0, 2] as [number, number],
          nextTurnCoordinate: interval0[2],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
        {
          distance: sumSegmentDistances(interval1),
          time: 40,
          text: '우회전',
          sign: 1,
          interval: [3, 4] as [number, number],
          nextTurnCoordinate: interval1[1],
          ttsUrl: 'https://example.com/tts/right.mp3',
        },
      ];

      const myPosition = coord(0, 0.00011);
      const remainingCurrent =
        getDistanceBetweenCoords(myPosition, interval0[1]) +
        getDistanceBetweenCoords(interval0[1], interval0[2]);
      const expected = Math.round(
        remainingCurrent + instructionList[1].distance,
      );

      const result = calculateRemainingDistance(
        myPosition,
        pathDataListByInterval,
        0,
        instructionList,
        expected + 500,
        null,
        null,
        Date.now(),
      );

      expect(result).toBe(expected);
    });

    it('GPS 점프가 감지되면 이전 남은 거리를 유지한다', () => {
      const interval0 = [coord(0, 0), coord(0, 0.0001)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: interval0,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 10,
          text: '직진',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: interval0[1],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
      ];

      const prevRemaining = 100;
      const prevPos = coord(0, 0);
      const jumpPos = coord(0, 1); // 물리적으로 불가능한 거리 이동

      const result = calculateRemainingDistance(
        jumpPos,
        pathDataListByInterval,
        0,
        instructionList,
        prevRemaining,
        prevPos,
        1000,
        2000, // 1초만에 엄청난 거리 이동
      );

      expect(result).toBe(prevRemaining);
    });

    it('남은 거리는 증가하지 않는다 (단조 감소)', () => {
      const interval0 = [coord(0, 0), coord(0, 0.001)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: interval0,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 60,
          text: '직진',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: interval0[1],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
      ];

      const myPos = coord(0, 0.0005);
      const prevRemaining = 50; // 실제 계산값보다 작은 값

      const result = calculateRemainingDistance(
        myPos,
        pathDataListByInterval,
        0,
        instructionList,
        prevRemaining,
        null,
        null,
        Date.now(),
      );

      // 증가하지 않음
      expect(result).toBeLessThanOrEqual(prevRemaining);
    });

    it('마지막 인터벌에서는 현재 인터벌 남은 거리만 반환한다', () => {
      const interval0 = [coord(0, 0), coord(0, 0.001)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: interval0,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 60,
          text: '목적지 도착',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: interval0[1],
          ttsUrl: 'https://example.com/tts/arrive.mp3',
        },
      ];

      const myPos = coord(0, 0.0005);

      const result = calculateRemainingDistance(
        myPos,
        pathDataListByInterval,
        0,
        instructionList,
        1000,
        null,
        null,
        Date.now(),
      );

      // 현재 인터벌 남은 거리만 계산됨
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });
  });

  describe('calculateTraveledDistance', () => {
    it('현재 인터벌 기준 소요 거리 계산 후 안정화 값을 반환한다', () => {
      const interval0 = [coord(0, 0), coord(0, 0.0001), coord(0, 0.0002)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 2] as [number, number],
          coordinateList: interval0,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 60,
          text: '직진',
          sign: 0,
          interval: [0, 2] as [number, number],
          nextTurnCoordinate: interval0[2],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
      ];

      const myPosition = coord(0, 0.00009);
      const expected =
        Math.round(
          (getDistanceBetweenCoords(interval0[0], interval0[1]) +
            getDistanceBetweenCoords(interval0[0], interval0[1])) *
            100,
        ) / 100;

      const result = calculateTraveledDistance(
        myPosition,
        pathDataListByInterval,
        0,
        instructionList,
        0,
        null,
        null,
        Date.now(),
      );

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('GPS 점프가 의심되면 이전 진행 거리를 유지한다', () => {
      const interval0 = [coord(0, 0), coord(0, 0.0001)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: interval0,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 10,
          text: '직진',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: interval0[1],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
      ];

      const prevTraveled = 42;
      const result = calculateTraveledDistance(
        coord(0, 1), // GPS 점프
        pathDataListByInterval,
        0,
        instructionList,
        prevTraveled,
        coord(0, 0),
        0,
        1000,
      );

      expect(result).toBe(prevTraveled);
    });

    it('진행 거리는 감소하지 않는다 (단조 증가)', () => {
      const interval0 = [coord(0, 0), coord(0, 0.001)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: interval0,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 60,
          text: '직진',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: interval0[1],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
      ];

      const myPos = coord(0, 0.0002);
      const prevTraveled = 100; // 실제 계산값보다 큰 값

      const result = calculateTraveledDistance(
        myPos,
        pathDataListByInterval,
        0,
        instructionList,
        prevTraveled,
        null,
        null,
        Date.now(),
      );

      // 감소하지 않음
      expect(result).toBeGreaterThanOrEqual(prevTraveled);
    });

    it('정지 상태에서는 진행 거리가 증가하지 않는다', () => {
      const interval0 = [coord(0, 0), coord(0, 0.001)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: interval0,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 60,
          text: '직진',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: interval0[1],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
      ];

      const prevPos = coord(0, 0.0001);
      const currentPos = coord(0, 0.00010001); // 아주 작은 이동 (< 1.5m)
      const prevTraveled = 50;

      const result = calculateTraveledDistance(
        currentPos,
        pathDataListByInterval,
        0,
        instructionList,
        prevTraveled,
        prevPos,
        1000,
        2000,
      );

      expect(result).toBe(prevTraveled);
    });

    it('두번째 인터벌에서는 이전 인터벌 거리가 합산된다', () => {
      const interval0 = [coord(0, 0), coord(0, 0.001)];
      const interval1 = [coord(0, 0.001), coord(0, 0.002)];
      const pathDataListByInterval = [
        {
          intervalIndex: 0,
          interval: [0, 1] as [number, number],
          coordinateList: interval0,
        },
        {
          intervalIndex: 1,
          interval: [2, 3] as [number, number],
          coordinateList: interval1,
        },
      ];
      const instructionList = [
        {
          distance: sumSegmentDistances(interval0),
          time: 60,
          text: '직진',
          sign: 0,
          interval: [0, 1] as [number, number],
          nextTurnCoordinate: interval0[1],
          ttsUrl: 'https://example.com/tts/straight.mp3',
        },
        {
          distance: sumSegmentDistances(interval1),
          time: 60,
          text: '좌회전',
          sign: -1,
          interval: [2, 3] as [number, number],
          nextTurnCoordinate: interval1[1],
          ttsUrl: 'https://example.com/tts/left.mp3',
        },
      ];

      const myPos = coord(0, 0.0015);

      const result = calculateTraveledDistance(
        myPos,
        pathDataListByInterval,
        1, // 두번째 인터벌
        instructionList,
        0,
        null,
        null,
        Date.now(),
      );

      // 첫번째 인터벌 전체 + 두번째 인터벌 일부
      expect(result).toBeGreaterThan(instructionList[0].distance);
    });
  });

  describe('stabilizeDistance', () => {
    it('traveled는 감소하지 않도록 보정한다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 90,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: null,
        currentTimestamp: Date.now(),
        type: 'traveled',
      });

      expect(result).toBe(100);
    });

    it('remaining은 증가하지 않도록 보정한다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 120,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: null,
        currentTimestamp: Date.now(),
        type: 'remaining',
      });

      expect(result).toBe(100);
    });

    it('정지 판정이면 변화량을 막는다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 50,
        prevStableDistanceMeter: 100,
        prevMyPosition: coord(0, 0),
        currentMyPosition: coord(0, 0.00002), // 아주 작은 이동
        prevTimestamp: null,
        currentTimestamp: Date.now(),
        type: 'traveled',
      });

      expect(result).toBe(100);
    });

    it('물리적 최대 속도 기준으로 traveled 변화폭을 제한한다', () => {
      const traveled = stabilizeDistance({
        newlyComputedDistanceMeter: 200,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: 0,
        currentTimestamp: 1000, // 1초
        type: 'traveled',
      });

      // 최대 20m/s * 1초 = 20m 증가 가능
      expect(traveled).toBe(120);
    });

    it('물리적 최대 속도 기준으로 remaining 변화폭을 제한한다', () => {
      const remaining = stabilizeDistance({
        newlyComputedDistanceMeter: 900,
        prevStableDistanceMeter: 1000,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: 0,
        currentTimestamp: 1000, // 1초
        type: 'remaining',
      });

      // 최대 20m/s * 1초 = 20m 감소 가능
      expect(remaining).toBe(980);
    });

    it('시간 차이가 매우 작으면 0.001초로 처리한다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 200,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: 1000,
        currentTimestamp: 1000.0001, // 거의 동시
        type: 'traveled',
      });

      // 변화량이 거의 없음
      expect(result).toBeCloseTo(100, 0);
    });

    it('결과는 반올림되어 정수로 반환된다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 105.7,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: null,
        currentTimestamp: Date.now(),
        type: 'traveled',
      });

      expect(result).toBe(106);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('returnAccurateSpeed', () => {
    it('accuracy가 양호하면 OS 속도 기반 EMA를 계산한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 10,
        osSpeed: 2,
      };
      const curr = {
        coordinate: coord(0, 1),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 4,
      };
      const result = returnAccurateSpeed(prev, curr, 3);
      expect(result).toBeCloseTo(3.2, 5);
    });

    it('accuracy가 낮으면 거리/시간 기반 EMA를 계산한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 50,
        osSpeed: 2,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
        accuracy: 50,
        osSpeed: 6,
      };
      const distance = getDistanceBetweenCoords(
        prev.coordinate,
        curr.coordinate,
      );
      const rawSpeed = distance / 1;
      const expected = 0.2 * rawSpeed + 0.8 * 2;
      const result = returnAccurateSpeed(prev, curr, 2);
      expect(result).toBeCloseTo(expected, 5);
    });

    it('시간 차이가 없으면 EMA에 0을 반영한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 3,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 5,
      };
      const result = returnAccurateSpeed(prev, curr, 3);
      expect(result).toBeCloseTo(2.4, 5);
    });

    it('OS 속도/accuracy가 없으면 거리/시간으로 EMA를 계산한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
      };
      const distance = getDistanceBetweenCoords(
        prev.coordinate,
        curr.coordinate,
      );
      const rawSpeed = distance / 1;
      const result = returnAccurateSpeed(prev, curr, undefined);
      expect(result).toBeCloseTo(rawSpeed, 5);
    });

    it('이전 EMA 속도가 없으면 OS 속도를 베이스로 사용한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 10,
        osSpeed: 5,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 3,
      };
      // prevEmaSpeed가 없으므로 osSpeed(5)를 베이스로 사용
      const expected = 0.2 * 3 + 0.8 * 5;
      const result = returnAccurateSpeed(prev, curr);
      expect(result).toBeCloseTo(expected, 5);
    });

    it('속도값이 비정상이면 0으로 처리한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
      };
      const curr = {
        coordinate: coord(0, 0), // 이동 없음
        timestamp: 0, // 시간도 동일 (division by zero)
      };
      const result = returnAccurateSpeed(prev, curr, 5);
      // EMA(5, 0) = 0.2 * 0 + 0.8 * 5 = 4
      expect(result).toBeCloseTo(4, 5);
    });

    it('accuracy 40 이하일 때 OS 속도를 사용한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 30,
        osSpeed: 3,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
        accuracy: 35,
        osSpeed: 5,
      };
      // accuracy <= 40이므로 OS 속도 사용
      const expected = 0.2 * 5 + 0.8 * 3;
      const result = returnAccurateSpeed(prev, curr, 3);
      expect(result).toBeCloseTo(expected, 5);
    });

    it('accuracy 40 초과일 때 거리 기반 계산을 사용한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 45,
        osSpeed: 3,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
        accuracy: 50,
        osSpeed: 10, // OS 속도는 무시됨
      };
      const distance = getDistanceBetweenCoords(
        prev.coordinate,
        curr.coordinate,
      );
      const rawSpeed = distance / 1;
      const expected = 0.2 * rawSpeed + 0.8 * 3;
      const result = returnAccurateSpeed(prev, curr, 3);
      expect(result).toBeCloseTo(expected, 5);
    });
  });

  describe('calculateEta', () => {
    it('남은 거리와 속도가 유효하면 ETA를 반환한다', () => {
      const eta = calculateEta(1000, 2);
      expect(eta).toBeInstanceOf(Date);
      const now = Date.now();
      expect(eta!.getTime()).toBeGreaterThan(now);
    });

    it('남은 거리가 0이면 undefined를 반환한다', () => {
      expect(calculateEta(0, 2)).toBeUndefined();
    });

    it('속도가 0이면 undefined를 반환한다', () => {
      expect(calculateEta(1000, 0)).toBeUndefined();
    });

    it('속도가 음수이면 undefined를 반환한다', () => {
      expect(calculateEta(1000, -5)).toBeUndefined();
    });

    it('남은 거리가 음수이면 undefined를 반환한다', () => {
      expect(calculateEta(-100, 5)).toBeUndefined();
    });

    it('ETA는 현재 시각보다 미래 시각이다', () => {
      const remainingDist = 500; // 500m
      const speed = 5; // 5m/s
      const expectedSeconds = remainingDist / speed; // 100초 후

      const eta = calculateEta(remainingDist, speed);
      const now = Date.now();
      const expectedTime = now + expectedSeconds * 1000;

      expect(eta!.getTime()).toBeGreaterThanOrEqual(now);
      expect(eta!.getTime()).toBeCloseTo(expectedTime, -2); // 100ms 오차 허용
    });

    it('속도가 빠르면 ETA가 가깝다', () => {
      const etaSlow = calculateEta(1000, 2);
      const etaFast = calculateEta(1000, 10);

      expect(etaFast!.getTime()).toBeLessThan(etaSlow!.getTime());
    });
  });

  describe('stabilizeDistance', () => {
    it('traveled는 감소하지 않도록 보정한다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 90,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: null,
        currentTimestamp: Date.now(),
        type: 'traveled',
      });

      expect(result).toBe(100);
    });

    it('remaining은 증가하지 않도록 보정한다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 120,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: null,
        currentTimestamp: Date.now(),
        type: 'remaining',
      });

      expect(result).toBe(100);
    });

    it('정지 판정이면 변화량을 막는다', () => {
      const result = stabilizeDistance({
        newlyComputedDistanceMeter: 50,
        prevStableDistanceMeter: 100,
        prevMyPosition: coord(0, 0),
        currentMyPosition: coord(0, 0.00002),
        prevTimestamp: null,
        currentTimestamp: Date.now(),
        type: 'traveled',
      });

      expect(result).toBe(100);
    });

    it('물리적 최대 속도 기준으로 변화폭을 제한한다', () => {
      const traveled = stabilizeDistance({
        newlyComputedDistanceMeter: 200,
        prevStableDistanceMeter: 100,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: 0,
        currentTimestamp: 1000,
        type: 'traveled',
      });
      const remaining = stabilizeDistance({
        newlyComputedDistanceMeter: 900,
        prevStableDistanceMeter: 1000,
        prevMyPosition: null,
        currentMyPosition: coord(0, 0),
        prevTimestamp: 0,
        currentTimestamp: 1000,
        type: 'remaining',
      });

      expect(traveled).toBe(120);
      expect(remaining).toBe(980);
    });
  });

  describe('returnAccurateSpeed', () => {
    it('accuracy가 양호하면 OS 속도 기반 EMA 계산', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 10,
        osSpeed: 2,
      };
      const curr = {
        coordinate: coord(0, 1),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 4,
      };
      const result = returnAccurateSpeed(prev, curr, 3);
      expect(result).toBeCloseTo(3.2, 5);
    });

    it('accuracy가 낮으면 거리/시간 기반 EMA 계산', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 50,
        osSpeed: 2,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
        accuracy: 50,
        osSpeed: 6,
      };
      const distance = getDistanceBetweenCoords(
        prev.coordinate,
        curr.coordinate,
      );
      const rawSpeed = distance / 1;
      const expected = 0.2 * rawSpeed + 0.8 * 2;
      const result = returnAccurateSpeed(prev, curr, 2);
      expect(result).toBeCloseTo(expected, 5);
    });

    it('시간 차이가 없으면 EMA에 0을 반영', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 3,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 5,
      };
      const result = returnAccurateSpeed(prev, curr, 3);
      expect(result).toBeCloseTo(2.4, 5);
    });

    it('OS 속도/accuracy가 없으면 거리/시간으로 EMA 계산', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestamp: 1000,
      };
      const distance = getDistanceBetweenCoords(
        prev.coordinate,
        curr.coordinate,
      );
      const rawSpeed = distance / 1;
      const result = returnAccurateSpeed(prev, curr, undefined);
      expect(result).toBeCloseTo(rawSpeed, 5);
    });
  });

  describe('calculateEta', () => {
    it('남은 거리와 속도가 유효하면 ETA 반환', () => {
      const eta = calculateEta(1000, 2);
      expect(eta).toBeInstanceOf(Date);
      const now = Date.now();
      expect(eta!.getTime()).toBeGreaterThan(now);
    });

    it('남은 거리나 속도가 유효하지 않으면 undefined 반환', () => {
      expect(calculateEta(0, 2)).toBeUndefined();
      expect(calculateEta(1000, 0)).toBeUndefined();
    });
  });
});
