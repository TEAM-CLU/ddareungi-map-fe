import { useMutation } from '@tanstack/react-query';
import { postFullJourney, postCircularJourney } from './routing.api';

// 통합 경로 검색
export const useFullJourneyMutation = () => {
  return useMutation({
    mutationFn: postFullJourney,
  });
};

// 원형 경로 검색
export const useCircularJourneyMutation = () => {
  return useMutation({
    mutationFn: postCircularJourney,
  });
};
