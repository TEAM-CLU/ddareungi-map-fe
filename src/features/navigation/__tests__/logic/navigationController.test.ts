import {
  calculateRemainingDistanceMeter,
  calculateTraveledDistanceMeter,
  calculateEta,
  returnAccurateSpeedMeterPerSec,
} from '@/features/navigation/utils/navigationController';
import { getDistanceBetweenCoords } from '@/features/location/utils/location';

describe('NavigationController 핵심 로직 검증', () => {
  const coord = (lat: number, lng: number) => ({ lat, lng });
  const round2 = (value: number) => Math.round(value * 100) / 100;
  const sumSegmentDistances = (coords: { lat: number; lng: number }[]) =>
    coords.slice(1).reduce((sum, curr, idx) => {
      return sum + getDistanceBetweenCoords(coords[idx], curr);
    }, 0);

  describe('calculateRemainingDistanceMeter', () => {
    const interval0 = [
      coord(37.5665, 126.978),
      coord(37.5666, 126.9785),
      coord(37.5667, 126.979),
    ];
    const interval1 = [coord(37.5668, 126.9795), coord(37.5669, 126.98)];

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

    it('현재 인터벌의 중간 좌표 기준으로 남은 거리 합산', () => {
      const myPosition = interval0[1];
      const currentIntervalRemaining = sumSegmentDistances(interval0.slice(1));
      const expected = round2(
        currentIntervalRemaining + instructionList[1].distance,
      );
      const result = calculateRemainingDistanceMeter(
        myPosition,
        pathDataListByInterval,
        0,
        instructionList,
      );
      expect(result).toBe(expected);
    });

    it('현재 인터벌 좌표가 1개일 때 남은 거리 계산', () => {
      const singleInterval = [coord(37.5669, 126.98)];
      const nextInterval = [coord(37.5671, 126.9805), coord(37.5672, 126.981)];
      const singlePathDataList = [
        {
          intervalIndex: 0,
          interval: [0, 0] as [number, number],
          coordinateList: singleInterval,
        },
        {
          intervalIndex: 1,
          interval: [1, 2] as [number, number],
          coordinateList: nextInterval,
        },
      ];
      const singleInstructionList = [
        {
          distance: 0,
          time: 0,
          text: '직진',
          sign: 0,
          interval: [0, 0] as [number, number],
          nextTurnCoordinate: singleInterval[0],
          ttsUrl: 'https://example.com/tts/keep.mp3',
        },
        {
          distance: sumSegmentDistances(nextInterval),
          time: 0,
          text: '다음 경로',
          sign: 0,
          interval: [1, 2] as [number, number],
          nextTurnCoordinate: nextInterval[1],
          ttsUrl: 'https://example.com/tts/next.mp3',
        },
      ];

      const myPosition = coord(37.567, 126.979);
      const expected = round2(
        getDistanceBetweenCoords(myPosition, singleInterval[0]) +
          singleInstructionList[1].distance,
      );
      const result = calculateRemainingDistanceMeter(
        myPosition,
        singlePathDataList,
        0,
        singleInstructionList,
      );
      expect(result).toBe(expected);
    });

    it('현재 인터벌 좌표가 없을 때 남은 인터벌 거리만 반환', () => {
      const emptyPathDataList = [
        {
          intervalIndex: 0,
          interval: [0, 0] as [number, number],
          coordinateList: [],
        },
        {
          intervalIndex: 1,
          interval: [1, 2] as [number, number],
          coordinateList: interval1,
        },
      ];
      const emptyInstructionList = [
        {
          distance: 0,
          time: 0,
          text: '출발',
          sign: 0,
          interval: [0, 0] as [number, number],
          nextTurnCoordinate: interval0[0],
          ttsUrl: 'https://example.com/tts/start.mp3',
        },
        {
          distance: sumSegmentDistances(interval1),
          time: 0,
          text: '다음 경로',
          sign: 0,
          interval: [1, 2] as [number, number],
          nextTurnCoordinate: interval1[1],
          ttsUrl: 'https://example.com/tts/next.mp3',
        },
      ];

      const result = calculateRemainingDistanceMeter(
        coord(37.5665, 126.978),
        emptyPathDataList,
        0,
        emptyInstructionList,
      );
      expect(result).toBe(round2(emptyInstructionList[1].distance));
    });
  });

  describe('calculateTraveledDistanceMeter', () => {
    const interval0 = [
      coord(37.5665, 126.978),
      coord(37.5666, 126.9785),
      coord(37.5667, 126.979),
    ];
    const interval1 = [coord(37.5668, 126.9795), coord(37.5669, 126.98)];

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

    it('현재 인터벌 중간 좌표 기준으로 소요 거리 합산', () => {
      const myPosition = interval0[1];
      const directDistance = getDistanceBetweenCoords(
        interval0[0],
        interval0[1],
      );
      const polylineDistance = sumSegmentDistances(interval0.slice(0, 2));
      const expected = round2(directDistance + polylineDistance);
      const result = calculateTraveledDistanceMeter(
        myPosition,
        pathDataListByInterval,
        0,
        instructionList,
      );
      expect(result).toBe(expected);
    });

    it('현재 인터벌 좌표가 1개일 때 소요 거리 계산', () => {
      const singleInterval = [coord(37.5669, 126.98)];
      const singlePathDataList = [
        {
          intervalIndex: 0,
          interval: [0, 2] as [number, number],
          coordinateList: interval0,
        },
        {
          intervalIndex: 1,
          interval: [3, 3] as [number, number],
          coordinateList: singleInterval,
        },
      ];
      const singleInstructionList = [
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
          distance: 0,
          time: 0,
          text: '도착',
          sign: 4,
          interval: [3, 3] as [number, number],
          nextTurnCoordinate: singleInterval[0],
          ttsUrl: 'https://example.com/tts/arrive.mp3',
        },
      ];

      const myPosition = coord(37.567, 126.981);
      const expected = round2(
        getDistanceBetweenCoords(singleInterval[0], myPosition) +
          singleInstructionList[0].distance,
      );
      const result = calculateTraveledDistanceMeter(
        myPosition,
        singlePathDataList,
        1,
        singleInstructionList,
      );
      expect(result).toBe(expected);
    });

    it('현재 인터벌 좌표가 없을 때 지난 인터벌 거리만 반환', () => {
      const emptyPathDataList = [
        {
          intervalIndex: 0,
          interval: [0, 2] as [number, number],
          coordinateList: interval0,
        },
        {
          intervalIndex: 1,
          interval: [3, 4] as [number, number],
          coordinateList: [],
        },
      ];
      const emptyInstructionList = [
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
          distance: 0,
          time: 0,
          text: '도착',
          sign: 4,
          interval: [3, 4] as [number, number],
          nextTurnCoordinate: interval0[2],
          ttsUrl: 'https://example.com/tts/arrive.mp3',
        },
      ];

      const result = calculateTraveledDistanceMeter(
        coord(37.5665, 126.978),
        emptyPathDataList,
        1,
        emptyInstructionList,
      );
      expect(result).toBe(round2(emptyInstructionList[0].distance));
    });
  });

  describe('returnAccurateSpeedMeter', () => {
    it('accuracy가 양호하면 OS 속도 기반 EMA 계산', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestemp: 0,
        accuracy: 10,
        osSpeed: 2,
      };
      const curr = {
        coordinate: coord(0, 1),
        timestemp: 1000,
        accuracy: 10,
        osSpeed: 4,
      };
      const result = returnAccurateSpeedMeterPerSec(prev, curr, 2);
      expect(result).toBeCloseTo(2.4, 5);
    });

    it('accuracy가 낮으면 거리/시간 기반 EMA 계산', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestemp: 0,
        accuracy: 50,
        osSpeed: 2,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestemp: 1000,
        accuracy: 50,
        osSpeed: 6,
      };
      const distance = getDistanceBetweenCoords(
        prev.coordinate,
        curr.coordinate,
      );
      const rawSpeed = distance / 1;
      const expected = 0.2 * rawSpeed + 0.8 * 2;
      const result = returnAccurateSpeedMeterPerSec(prev, curr, 2);
      expect(result).toBeCloseTo(expected, 5);
    });

    it('시간 차이가 없으면 EMA에 0을 반영', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestemp: 1000,
        accuracy: 10,
        osSpeed: 3,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestemp: 1000,
        accuracy: 10,
        osSpeed: 5,
      };
      const result = returnAccurateSpeedMeterPerSec(prev, curr, 3);
      expect(result).toBeCloseTo(2.4, 5);
    });

    it('OS 속도/accuracy가 없으면 거리/시간으로 EMA 계산', () => {
      const prev = {
        coordinate: coord(0, 0),
        timestemp: 0,
      };
      const curr = {
        coordinate: coord(0, 0.001),
        timestemp: 1000,
      };
      const distance = getDistanceBetweenCoords(
        prev.coordinate,
        curr.coordinate,
      );
      const rawSpeed = distance / 1;
      const result = returnAccurateSpeedMeterPerSec(prev, curr, undefined);
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
