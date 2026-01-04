import { TimerStatus } from '@/features/navigation/model/navigation.types';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useTimer = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');

  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (intervalIdRef.current) return;
    setTimerStatus('running');

    intervalIdRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setTimerStatus(prev => (prev === 'running' ? 'paused' : prev));
  }, [clearTimer]);

  const resetTimer = useCallback(
    (nextSeconds = 0) => {
      clearTimer();
      setSeconds(nextSeconds);
      setTimerStatus('idle');
    },
    [clearTimer],
  );

  // 컴포넌트 unmount 시 누수 방지
  useEffect(() => clearTimer, [clearTimer]);

  return {
    seconds,
    timerStatus,
    setTimerStatus,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
