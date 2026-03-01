import { useEffect, useRef } from 'react';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { playMeasurementTts } from '../utils/playMeasurementTts';

/**
 * 목표 거리 도달 시 TTS 재생 후 자동 종료
 */
export function useMeasurementGoalReached(): void {
  const { phase, isPaused, targetDistanceKm, metrics, setPhase, setSessionResult, elapsedTimeSeconds } =
    useMeasurementStore();
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

    const distKm = metrics.traveledDistanceMeter / 1000;
    const totalAvgSpeedKmh =
      elapsedTimeSeconds > 0 && distKm > 0
        ? distKm / (elapsedTimeSeconds / 3600)
        : 0;
    const avgPace = totalAvgSpeedKmh > 0 ? 60 / totalAvgSpeedKmh : null;

    setSessionResult({
      traveledDistanceMeter: metrics.traveledDistanceMeter,
      elapsedTimeSeconds,
      caloriesBurned: metrics.caloriesBurned,
      averagePaceMinutesPerKm: avgPace,
      averageSpeedKmh: totalAvgSpeedKmh,
      maxSpeedKmh: metrics.speedKmh,
    });
    setPhase('ended');
  }, [
    phase,
    isPaused,
    targetDistanceKm,
    metrics.traveledDistanceMeter,
    metrics.caloriesBurned,
    metrics.averageSpeedKmh,
    metrics.speedKmh,
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
