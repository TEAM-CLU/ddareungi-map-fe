import { Coordinate } from '@/shared/model/shared.types';

export type MeasurementPhase =
  | 'idle'
  | 'goal-setting'
  | 'countdown'
  | 'measuring'
  | 'paused'
  | 'ended';

export interface MeasurementLiveMetrics {
  traveledDistanceMeter: number;
  caloriesBurned: number;
  paceMinutesPerKm: number | null;
  speedKmh: number;
  averageSpeedKmh: number;
}

export interface MeasurementSessionResult {
  traveledDistanceMeter: number;
  elapsedTimeSeconds: number;
  caloriesBurned: number;
  averagePaceMinutesPerKm: number | null;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
}
