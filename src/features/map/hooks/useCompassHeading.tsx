import {
  CompassHeadingData,
  UseUserHeadingOptions,
} from '@/features/map/model/map.types';
import { norm360, lerpAngle, angleDiff } from '@/features/map/utils/heading';
import { useEffect, useRef, useState } from 'react';
import CompassHeading from 'react-native-compass-heading';

export const useUserHeading = (opts: UseUserHeadingOptions = {}) => {
  const {
    triggerDeg = 1,
    updateDeg = 1,
    throttleMs = 16, // 60fps 기준
    smoothAlpha = 0.6, // 더 빠른 반응
  } = opts;

  const [heading, setHeading] = useState<number>(0);
  const startedRef = useRef(false);

  const lastEmitTsRef = useRef(0); // 마지막으로 값을 반영한 시간
  const smoothDegRef = useRef<number | null>(null); // 부드럽게 처리된 최종 값
  const emittedDegRef = useRef<number>(0); // 마지막으로 반영한 값

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    CompassHeading.start(
      updateDeg,
      ({ heading: sensorHeading }: CompassHeadingData) => {
        const nowTime = Date.now();
        const rawNormalizedHeading = norm360(sensorHeading);

        // 1. 스로틀:  마지막 반영시간과의 간극 체크 -> 너무 빠르면 heading값 무시
        if (nowTime - lastEmitTsRef.current < throttleMs) return;

        // 2. 스무딩(EMA를 각도보간으로): 이전 스무딩값과 새값을 보간
        const prevFinalDeg = smoothDegRef.current ?? rawNormalizedHeading;
        const t = 1 - Math.max(0, Math.min(smoothAlpha, 1));
        const smoothedDeg = lerpAngle(prevFinalDeg, rawNormalizedHeading, t);
        smoothDegRef.current = smoothedDeg;

        // 3. 데드밴드(이전에 반영한 값 기준)
        if (angleDiff(smoothedDeg, emittedDegRef.current) < triggerDeg) return;

        // 4. 반영
        lastEmitTsRef.current = nowTime;
        emittedDegRef.current = smoothedDeg;
        setHeading(smoothedDeg);
      },
    );

    return () => {
      CompassHeading.stop();
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return heading;
};
