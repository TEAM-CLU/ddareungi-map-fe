import { Segment } from '@/features/routing/model/routing.types';

// 도보 시간 계산 (segments에서 walking 구간 찾기)
export const calculateWalkingTime = (segments: Segment[]): number => {
  return segments
    .filter(seg => seg.type === 'walking')
    .reduce((total, seg) => total + seg.summary.time, 0);
};
