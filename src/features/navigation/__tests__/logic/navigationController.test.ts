import {
  calculateRemainingDistance,
  calculateTraveledDistance,
  calculateEta,
  returnAccurateSpeed,
  stabilizeDistance,
} from '@/features/navigation/utils/navigationController';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';

describe('navigationController 핵심 로직 검증', () => {
  const coord = (lat: number, lng: number) => ({ lat, lng });
  const sumSegmentDistances = (coords: { lat: number; lng: number }[]) =>
    coords.slice(1).reduce((sum, curr, idx) => {
      return sum + getDistanceBetweenCoords(coords[idx], curr);
    }, 0);

  describe('calculateRemainingDistance', () => {
    it('현재 인터벌 + 이후 인터벌 거리 합산 후 안정화 값 반환', () => {
      const interval0 = [
        coord(0, 0),
        coord(0, 0.0001),
        coord(0, 0.0002),
      ];
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
      const expected = Math.round(remainingCurrent + instructionList[1].distance);

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
  });

  describe('calculateTraveledDistance', () => {
    it('현재 인터벌 기준 소요 거리 계산 후 안정화 값 반환', () => {
      const interval0 = [
        coord(0, 0),
        coord(0, 0.0001),
        coord(0, 0.0002),
      ];
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
      const expected = Math.round(
        getDistanceBetweenCoords(interval0[0], interval0[1]) +
          getDistanceBetweenCoords(interval0[0], interval0[1]),
      );

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

      expect(result).toBe(expected);
    });

    it('GPS 점프가 의심되면 이전 진행거리 유지', () => {
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
        coord(0, 1),
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
