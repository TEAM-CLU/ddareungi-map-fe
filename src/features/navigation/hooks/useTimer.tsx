import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

let sharedIntervalId: ReturnType<typeof setInterval> | null = null;

// 전역적으로 타이머를 정리하는 함수 (네비게이션 종료 시 사용)
export const clearSharedTimer = () => {
  if (sharedIntervalId) {
    clearInterval(sharedIntervalId);
    sharedIntervalId = null;
  }
};

export const useTimer = (initialSeconds = 0) => {
  const { seconds, setSeconds, addSeconds, timerStatus, setTimerStatus } =
    useNavigationStore(
      useShallow(state => ({
        seconds: state.seconds,
        setSeconds: state.setSeconds,
        addSeconds: state.addSeconds,
        timerStatus: state.timerStatus,
        setTimerStatus: state.setTimerStatus,
      })),
    );

  useEffect(() => {
    // 1. 실행 중(running) 상태일 때만 인터벌 생성
    if (timerStatus === 'running') {
      if (!sharedIntervalId) {
        sharedIntervalId = setInterval(() => {
          addSeconds(1);
        }, 1000);
      }
    } else {
      // 2. idle이나 paused면 인터벌 정지
      if (sharedIntervalId) {
        clearInterval(sharedIntervalId);
        sharedIntervalId = null;
      }
    }
  }, [timerStatus, addSeconds]);

  const startTimer = () => setTimerStatus('running');
  const pauseTimer = () => setTimerStatus('paused');

  const resetTimer = (nextSeconds = 0) => {
    setSeconds(nextSeconds);
    setTimerStatus('idle');
  };

  return {
    seconds,
    timerStatus,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
