import { useQuery } from "@tanstack/react-query";
import { FullJourneyPayload, FullJourneyResponse } from "../model/routing.types";
import { postFullJourney } from "./routing.api";

// 통합 경로 검색
export const useFullJourneyQuery = (payload?: FullJourneyPayload) => {
  const query = useQuery<FullJourneyResponse>({
    queryKey: ['routing', 'full-journey', payload],
    queryFn: () => {
      if (!payload) throw new Error('payload가 필요합니다.');
      return postFullJourney(payload);
    },
    enabled: !!payload,
    staleTime: 0,
    gcTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return query;
};