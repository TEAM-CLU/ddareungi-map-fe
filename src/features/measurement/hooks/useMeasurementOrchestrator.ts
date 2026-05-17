import { useCallback, useEffect, useRef } from 'react';
import { useMeasurementStore } from '../stores/useMeasurementStore';
import { useMeasurementMetrics } from './useMeasurementMetrics';
import { useMeasurementGoalReached } from './useMeasurementGoalReached';
import { playMeasurementTts } from '../utils/playMeasurementTts';
import { createMeasurementSessionResult } from '../utils/createMeasurementSessionResult';

export function useMeasurementOrchestrator() {
  const {
    phase,
    setPhase,
    setElapsedTimeSeconds,
    elapsedTimeSeconds,
    isPaused,
    setIsPaused,
    resetMetrics,
    setSessionResult,
    metrics,
    resetSession,
  } = useMeasurementStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useMeasurementMetrics();
  useMeasurementGoalReached();

  useEffect(() => {
    if (phase === 'measuring' && !isPaused) {
      if (startTimeRef.current == null) {
        startTimeRef.current = Date.now();
      }
      timerRef.current = setInterval(() => {
        if (startTimeRef.current == null) return;
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTimeSeconds(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused, setElapsedTimeSeconds]);

  const handleStartCountdown = useCallback(() => {
    resetMetrics();
    setElapsedTimeSeconds(0);
    startTimeRef.current = null;
    setPhase('countdown');
  }, [resetMetrics, setElapsedTimeSeconds, setPhase]);

  const handleStartMeasuring = useCallback(() => {
    setPhase('measuring');
    setIsPaused(false);
    startTimeRef.current = Date.now();
    playMeasurementTts.ridingStart();
  }, [setPhase, setIsPaused]);

  const handleTogglePause = useCallback(() => {
    if (isPaused) {
      // paused 동안 경과한 벽시계 시간을 제외하도록 기준 시작시각 보정
      startTimeRef.current = Date.now() - elapsedTimeSeconds * 1000;
      setIsPaused(false);
      setPhase('measuring');
      playMeasurementTts.ridingRestart();
    } else {
      setIsPaused(true);
      setPhase('paused');
      playMeasurementTts.tempStop();
    }
  }, [elapsedTimeSeconds, isPaused, setIsPaused, setPhase]);

  const handleFinishMeasurement = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    playMeasurementTts.finish();

    setSessionResult(
      createMeasurementSessionResult({
        metrics,
        elapsedTimeSeconds,
      }),
    );
    setPhase('ended');
  }, [
    metrics,
    elapsedTimeSeconds,
    setSessionResult,
    setPhase,
  ]);

  const handleCloseEnd = useCallback(() => {
    resetSession();
  }, [resetSession]);

  return {
    phase,
    handleStartCountdown,
    handleStartMeasuring,
    handleTogglePause,
    handleFinishMeasurement,
    handleCloseEnd,
  };
}
