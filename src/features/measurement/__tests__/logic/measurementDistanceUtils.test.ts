import {
  calculateFreeTraveledDistanceMeter,
  calculateSpeedMps,
  getDistanceNoiseGateMeter,
  hasTrustedMeasurementOsSpeed,
} from '@/features/measurement/utils/measurementDistanceUtils';
import { getDistanceBetweenCoords } from '@/shared/utils/measure';

describe('measurementDistanceUtils', () => {
  const coord = (lat: number, lng: number) => ({ lat, lng });
  const meta = (
    lat: number,
    lng: number,
    timestamp: number,
    accuracy = 8,
    osSpeed?: number,
  ) => ({
    coordinate: coord(lat, lng),
    timestamp,
    accuracy,
    osSpeed,
  });

  const simulateAnchoredDistance = (
    points: Array<{
      lat: number;
      lng: number;
      timestamp: number;
      accuracy?: number;
    }>,
  ) => {
    let anchor = points[0];
    let traveled = 0;
    const outputs = [0];

    for (let i = 1; i < points.length; i += 1) {
      const current = points[i];
      const noiseGate = getDistanceNoiseGateMeter(
        anchor.accuracy,
        current.accuracy,
      );
      const nextTraveled = calculateFreeTraveledDistanceMeter(
        coord(anchor.lat, anchor.lng),
        coord(current.lat, current.lng),
        traveled,
        anchor.timestamp,
        current.timestamp,
        noiseGate,
      );

      if (nextTraveled > traveled) {
        anchor = current;
      }

      traveled = nextTraveled;
      outputs.push(traveled);
    }

    return outputs;
  };

  describe('calculateSpeedMps', () => {
    it('현재 OS 속도만 신뢰 가능해도 첫 틱부터 즉시 반영한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 10,
      };
      const curr = {
        coordinate: coord(0, 0),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 5,
      };

      const result = calculateSpeedMps(prev, curr);

      expect(result).toBeCloseTo(5, 5);
    });

    it('현재 OS 속도가 trusted이면 이전 EMA로 낮추지 않고 즉시 반영한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
        accuracy: 10,
        osSpeed: 2,
      };
      const curr = {
        coordinate: coord(0, 0),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 5,
      };

      const result = calculateSpeedMps(prev, curr, 2);

      expect(result).toBeCloseTo(5, 5);
    });

    it('이전 EMA가 0이어도 trusted OS 속도를 1/4 수준으로 낮추지 않는다', () => {
      const prev = {
        coordinate: coord(37.5665, 126.978),
        timestamp: 0,
        accuracy: 10,
      };
      const curr = {
        coordinate: coord(37.566501, 126.978),
        timestamp: 1000,
        accuracy: 10,
        osSpeed: 5,
      };

      const result = calculateSpeedMps(prev, curr, 0);

      expect(result).toBeCloseTo(5, 5);
    });

    it('OS 속도가 없으면 물리적으로 가능한 범위의 거리 기반 속도를 사용한다', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestamp: 0,
      };
      const curr = {
        coordinate: coord(0, 0.00009),
        timestamp: 1000,
      };

      const result = calculateSpeedMps(prev, curr);

      expect(result).toBeGreaterThan(9);
    });

    it('연속 좌표에서도 OS speed가 있으면 반응이 늦지 않다', () => {
      const prev = meta(37.5665, 126.978, 0, 8, 4.8);
      const curr = meta(37.566518, 126.978, 1000, 8, 5.2);
      const rawSpeed = getDistanceBetweenCoords(prev.coordinate, curr.coordinate);

      const result = calculateSpeedMps(prev, curr, 4.8);

      expect(rawSpeed).toBeLessThan(3);
      expect(result).toBeGreaterThan(4.5);
    });

    it('accuracy가 40m 수준이어도 현재 OS speed를 라이브 속도에 반영한다', () => {
      const prev = meta(37.5665, 126.978, 0, 35, 4.5);
      const curr = meta(37.566505, 126.978, 1000, 35, 5);

      const result = calculateSpeedMps(prev, curr, 4.5);

      expect(result).toBeGreaterThan(4.4);
    });

    it('accuracy가 70m 수준이어도 trusted OS speed를 유지한다', () => {
      const prev = meta(37.5665, 126.978, 0, 70, 4.8);
      const curr = meta(37.566501, 126.978, 1000, 70, 5.1);

      const result = calculateSpeedMps(prev, curr, 4.8);

      expect(result).toBeGreaterThan(4.9);
    });
  });

  describe('hasTrustedMeasurementOsSpeed', () => {
    it('측정 허용 정확도 범위에서는 OS speed를 trusted로 본다', () => {
      expect(
        hasTrustedMeasurementOsSpeed(meta(37.5665, 126.978, 0, 70, 4.8)),
      ).toBe(true);
    });

    it('측정 허용 범위를 넘는 정확도에서는 OS speed를 trusted로 보지 않는다', () => {
      expect(
        hasTrustedMeasurementOsSpeed(meta(37.5665, 126.978, 0, 90, 4.8)),
      ).toBe(false);
    });
  });

  describe('calculateFreeTraveledDistanceMeter', () => {
    it('내부 누적은 소수 거리까지 유지해 계단식 점프를 줄인다', () => {
      const result = calculateFreeTraveledDistanceMeter(
        coord(37.5665, 126.978),
        coord(37.566538, 126.978),
        0,
        0,
        1000,
        3,
      );

      expect(result).toBeGreaterThan(4);
      expect(Number.isInteger(result)).toBe(false);
    });

    it('기준점은 유지한 채 작은 이동을 누적하다가 임계치를 넘기면 거리로 반영한다', () => {
      const anchor = coord(37.5, 127);
      const almostMoving = coord(37.500018, 127);
      const clearlyMoving = coord(37.50004, 127);

      const first = calculateFreeTraveledDistanceMeter(
        anchor,
        almostMoving,
        0,
        0,
        1000,
        3,
      );
      const second = calculateFreeTraveledDistanceMeter(
        anchor,
        clearlyMoving,
        first,
        0,
        2000,
        3,
      );

      expect(first).toBe(0);
      expect(second).toBeGreaterThanOrEqual(4);
    });

    it('서울 좌표 시퀀스에서 초반 소이동은 누적하다가 실제 이동이 확인되면 즉시 반영한다', () => {
      const distances = simulateAnchoredDistance([
        { lat: 37.5665, lng: 126.978, timestamp: 0, accuracy: 8 },
        { lat: 37.566512, lng: 126.978, timestamp: 1000, accuracy: 8 },
        { lat: 37.566522, lng: 126.978, timestamp: 2000, accuracy: 8 },
        { lat: 37.566534, lng: 126.978, timestamp: 3000, accuracy: 8 },
        { lat: 37.566579, lng: 126.978, timestamp: 4000, accuracy: 8 },
      ]);

      expect(distances[1]).toBe(0);
      expect(distances[2]).toBe(0);
      expect(distances[3]).toBeGreaterThanOrEqual(3);
      expect(distances[4]).toBeGreaterThanOrEqual(8);
    });

    it('이동 후 정지 드리프트 좌표는 추가 거리로 누적하지 않는다', () => {
      const distances = simulateAnchoredDistance([
        { lat: 37.5665, lng: 126.978, timestamp: 0, accuracy: 8 },
        { lat: 37.56654, lng: 126.978, timestamp: 1000, accuracy: 8 },
        { lat: 37.566541, lng: 126.978002, timestamp: 2000, accuracy: 9 },
        { lat: 37.566539, lng: 126.978001, timestamp: 3000, accuracy: 9 },
      ]);

      expect(distances[1]).toBeGreaterThanOrEqual(4);
      expect(distances[2]).toBe(distances[1]);
      expect(distances[3]).toBe(distances[1]);
    });
  });
});
