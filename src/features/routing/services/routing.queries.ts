import { useQuery } from '@tanstack/react-query';
import {
  FullJourneyPayload,
  CircularJourneyPayload,
  RouteResponse,
} from '../model/routing.types';
import { postFullJourney, postCircularJourney } from './routing.api';

// 통합 경로 검색 (필요 시 사용)
export const useFullJourneyQuery = (payload?: FullJourneyPayload) => {
  const query = useQuery<RouteResponse>({
    queryKey: ['routing', 'full-journey', payload],
    queryFn: () => {
      if (!payload) throw new Error('payload가 필요합니다.');
      return postFullJourney(payload);
    },
    enabled: !!payload && !!payload.start && !!payload.end,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return query;
};

// 원형 경로 검색 (필요 시 사용)
export const useCircularJourneyQuery = (payload?: CircularJourneyPayload) => {
  const query = useQuery<RouteResponse>({
    queryKey: ['routing', 'circular-journey', payload],
    queryFn: () => {
      if (!payload) throw new Error('payload가 필요합니다.');
      return postCircularJourney(payload);
    },
    enabled: !!payload && !!payload.start && payload.targetDistance > 0,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return query;
};
