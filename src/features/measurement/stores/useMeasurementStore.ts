import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  MeasurementPhase,
  MeasurementLiveMetrics,
  MeasurementSessionResult,
} from '../model/measurement.types';
import { MEASUREMENT_GOAL_CONFIG } from '../model/measurement.constants';

const initialMetrics: MeasurementLiveMetrics = {
  traveledDistanceMeter: 0,
  caloriesBurned: 0,
  paceMinutesPerKm: null,
  speedKmh: 0,
  averageSpeedKmh: 0,
  maxSpeedKmh: 0,
};

interface MeasurementState {
  isMeasurementScreenActive: boolean;
  phase: MeasurementPhase;
  targetDistanceKm: number;
  elapsedTimeSeconds: number;
  metrics: MeasurementLiveMetrics;
  isPaused: boolean;
  sessionResult: MeasurementSessionResult | null;

  setPhase: (phase: MeasurementPhase) => void;
  setTargetDistanceKm: (km: number) => void;
  setElapsedTimeSeconds: (s: number) => void;
  setMetrics: (m: Partial<MeasurementLiveMetrics>) => void;
  resetMetrics: () => void;
  setIsPaused: (p: boolean) => void;
  setSessionResult: (r: MeasurementSessionResult | null) => void;
  setMeasurementScreenActive: (active: boolean) => void;
  resetSession: () => void;
}

export const useMeasurementStore = create<MeasurementState>()(
  devtools(
    set => ({
      isMeasurementScreenActive: false,
      phase: 'goal-setting',
      targetDistanceKm: MEASUREMENT_GOAL_CONFIG.DEFAULT_TARGET_KM,
      elapsedTimeSeconds: 0,
      metrics: initialMetrics,
      isPaused: false,
      sessionResult: null,

      setPhase: phase => set({ phase }, false, 'measurement/setPhase'),
      setTargetDistanceKm: km =>
        set({ targetDistanceKm: km }, false, 'measurement/setTargetDistanceKm'),
      setElapsedTimeSeconds: s =>
        set({ elapsedTimeSeconds: s }, false, 'measurement/setElapsedTimeSeconds'),
      setMetrics: m =>
        set(
          state => ({ metrics: { ...state.metrics, ...m } }),
          false,
          'measurement/setMetrics',
        ),
      resetMetrics: () =>
        set({ metrics: initialMetrics }, false, 'measurement/resetMetrics'),
      setIsPaused: p => set({ isPaused: p }, false, 'measurement/setIsPaused'),
      setSessionResult: r =>
        set({ sessionResult: r }, false, 'measurement/setSessionResult'),
      setMeasurementScreenActive: active =>
        set(
          { isMeasurementScreenActive: active },
          false,
          'measurement/setMeasurementScreenActive',
        ),
      resetSession: () =>
        set(
          {
            phase: 'goal-setting',
            targetDistanceKm: MEASUREMENT_GOAL_CONFIG.DEFAULT_TARGET_KM,
            elapsedTimeSeconds: 0,
            metrics: initialMetrics,
            isPaused: false,
            sessionResult: null,
          },
          false,
          'measurement/resetSession',
        ),
    }),
    { name: 'measurement' },
  ),
);
