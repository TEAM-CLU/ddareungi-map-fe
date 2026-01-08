import { TimerStatus } from '@/features/navigation/model/navigation.types';
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

let sharedIntervalId: ReturnType<typeof setInterval> | null = null;
let sharedOwnerCount = 0;

// 전역적으로 타이머를 정리하는 함수 (네비게이션 종료 시 사용)
export const clearSharedTimer = () => {
  if (sharedIntervalId) {
    clearInterval(sharedIntervalId);
    sharedIntervalId = null;
  }
  sharedOwnerCount = 0;
};

export const useTimer = (initialSeconds = 0) => {
  const { seconds, setSeconds, addSeconds } = useNavigationStore(
    useShallow(state => ({
      seconds: state.seconds,
      setSeconds: state.setSeconds,
      addSeconds: state.addSeconds,
    })),
  );
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');

  const clearTimer = useCallback(() => {
    if (sharedIntervalId) {
      clearInterval(sharedIntervalId);
      sharedIntervalId = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (sharedIntervalId) return;
    setTimerStatus('running');

    sharedIntervalId = setInterval(() => {
      addSeconds(1);
    }, 1000);
  }, [addSeconds]);

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
    [clearTimer, setSeconds],
  );

  // 컴포넌트 unmount 시 누수 방지
  useEffect(() => {
    sharedOwnerCount += 1;
    return () => {
      sharedOwnerCount -= 1;
      if (sharedOwnerCount <= 0) {
        clearTimer();
        sharedOwnerCount = 0;
      }
    };
  }, [clearTimer]);

  return {
    seconds,
    timerStatus,
    setTimerStatus,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
