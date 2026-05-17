import { useEffect, useRef } from 'react';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { playMeasurementTts } from '../utils/playMeasurementTts';
import { createMeasurementSessionResult } from '../utils/createMeasurementSessionResult';

/**
 * 목표 거리 도달 시 TTS 재생 후 자동 종료
 */
export function useMeasurementGoalReached(): void {
  const {
    phase,
    isPaused,
    targetDistanceKm,
    metrics,
    setPhase,
    setSessionResult,
    elapsedTimeSeconds,
  } = useMeasurementStore();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (phase !== 'measuring' || isPaused) return;

    const targetMeter = targetDistanceKm * 1000;
    if (targetMeter <= 0) return;
    if (metrics.traveledDistanceMeter < targetMeter) return;
    if (hasTriggeredRef.current) return;

    hasTriggeredRef.current = true;
    playMeasurementTts.arriveAimedDistance();
    playMeasurementTts.finish();

    setSessionResult(
      createMeasurementSessionResult({
        metrics,
        elapsedTimeSeconds,
      }),
    );
    setPhase('ended');
  }, [
    phase,
    isPaused,
    targetDistanceKm,
    metrics.traveledDistanceMeter,
    metrics.caloriesBurned,
    metrics.averageSpeedKmh,
    metrics.maxSpeedKmh,
    elapsedTimeSeconds,
    setPhase,
    setSessionResult,
  ]);

  useEffect(() => {
    if (phase === 'goal-setting' || phase === 'countdown') {
      hasTriggeredRef.current = false;
    }
  }, [phase]);
}
