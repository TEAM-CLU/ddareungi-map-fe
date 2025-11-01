import RouteProgressStepBar from '@/features/routing/components/RouteProgressStepBar';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import StationBadge from '@/shared/components/badge/StationBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import WalkTimeBadge from '@/shared/components/badge/WalkTimeBadge';
import { tw } from '@/shared/libs/tw-helper';
import { View, Text, TouchableOpacity } from 'react-native';
import type { RouteResponse, Segment } from '../model/routing.types';

interface RouteSelectContainerProps {
  routes?: RouteResponse | null;
  isLoading?: boolean;
  error?: string | null;
  baseTime: Date;
}

const RouteSelectContainer = ({
  routes,
  isLoading,
  error,
  baseTime,
}: RouteSelectContainerProps) => {
  // 시간 포맷팅 함수 (초 → n시간 n분)
  const formatTime = (seconds: number): string => {
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  };

  // 거리 포맷팅 함수 (미터 → km)
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(1);
  };

  // 도보 시간 계산 함수 (segments에서 walking 구간 찾기)
  const calculateWalkingTime = (segments: Segment[]): number => {
    return segments
      .filter(seg => seg.type === 'walking')
      .reduce((total, seg) => total + seg.summary.time, 0);
  };

  // 시간대 포맷팅 함수 (baseTime 기준 ~ 도착 예정 시간)
  const formatTimeRange = (durationSeconds: number): string => {
    const arrival = new Date(baseTime.getTime() + durationSeconds * 1000);

    const formatHourMinute = (date: Date): string => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours < 12 ? '오전' : '오후';
      const displayHours = hours % 12 || 12;
      return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    };

    return `${formatHourMinute(baseTime)} - ${formatHourMinute(arrival)}`;
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <View
        style={[
          tw(
            'bg-surface-primary w-full px-4 py-5 flex items-center justify-center',
          ),
          { height: 300 },
        ]}
      >
        <Text style={tw('text-on-surface-placeholder font-primary-500')}>
          경로를 검색하고 있습니다...
        </Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View
        style={[
          tw(
            'bg-surface-primary w-full px-4 py-5 flex items-center justify-center',
          ),
          { height: 300 },
        ]}
      >
        <Text style={tw('text-red-500 font-primary-500 text-center')}>
          {error}
        </Text>
      </View>
    );
  }

  // 경로 데이터가 없는 경우
  if (!routes || !routes.data || routes.data.length === 0) {
    return (
      <View
        style={[
          tw(
            'bg-surface-primary w-full px-4 py-5 flex items-center justify-center',
          ),
          { height: 300 },
        ]}
      >
        <Text
          style={tw('text-on-surface-placeholder font-primary-500 text-center')}
        >
          출발지와 도착지를 설정하면{'\n'}경로를 검색해드릴게요
        </Text>
      </View>
    );
  }

  // 모든 경로 렌더링
  return (
    <View style={tw('w-full')}>
      {routes.data.map((route, index) => {
        const { routeCategory, summary, startStation, endStation, segments } =
          route;

        // 시간 포맷팅
        const timeText = formatTime(summary.time);

        // 거리 포맷팅
        const distanceKm = formatDistance(summary.distance);

        // 도보 시간 계산 (분 단위)
        const walkingMinutes = Math.round(calculateWalkingTime(segments) / 60);

        // 시간대 범위 (현재 ~ 도착 예정)
        const timeRange = formatTimeRange(summary.time);

        // 세그먼트별 시간 계산
        const firstWalkingSegment = segments.find(
          seg => seg.type === 'walking',
        );
        const bikingSegment = segments.find(seg => seg.type === 'biking');
        const lastWalkingSegment = segments
          .slice()
          .reverse()
          .find(seg => seg.type === 'walking');

        const firstWalkingMinutes = firstWalkingSegment
          ? Math.round(firstWalkingSegment.summary.time / 60)
          : 0;
        const bikingMinutes = bikingSegment
          ? Math.round(bikingSegment.summary.time / 60)
          : 0;
        const lastWalkingMinutes =
          lastWalkingSegment && lastWalkingSegment !== firstWalkingSegment
            ? Math.round(lastWalkingSegment.summary.time / 60)
            : 0;

        return (
          <TouchableOpacity
            key={route.routeId || `route-${index}`}
            style={[
              tw(
                'bg-surface-primary w-full px-4 py-5 flex flex-col items-start justify-between border-b',
              ),
              { height: 300, borderColor: '#D8D8D8' },
            ]}
          >
            {/* 상단부 */}
            <View style={[tw('w-full flex flex-col'), { gap: 6 }]}>
              <Text
                style={[
                  tw('font-primary-700 text-brand-primary text-left'),
                  { fontSize: 12 },
                ]}
              >
                {routeCategory}
              </Text>
              <Text
                style={[
                  tw('font-primary-700 text-on-surface-primary text-left'),
                  { fontSize: 24 },
                ]}
              >
                {timeText}
              </Text>
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-primary text-left'),
                  { fontSize: 12 },
                ]}
              >
                {timeRange}
              </Text>
              <View
                style={[
                  tw('w-full flex flex-row justify-start items-center'),
                  { gap: 14 },
                ]}
              >
                <Text
                  style={[
                    tw('font-primary-600 text-on-surface-primary'),
                    { fontSize: 15 },
                  ]}
                >
                  {distanceKm}km
                </Text>
                <View style={[tw('flex flex-row items-center'), { gap: 8 }]}>
                  <CalorieBadge value={143} />
                  <TreeBadge value={1} />
                </View>
              </View>
            </View>

            <RouteProgressStepBar
              firstWalkingMinutes={firstWalkingMinutes}
              bikingMinutes={bikingMinutes}
              lastWalkingMinutes={lastWalkingMinutes}
            />

            {/* 하단부 - 도보 시간 및 대여소 정보 */}
            <View style={[tw('w-full flex flex-col items-start'), { gap: 8 }]}>
              {walkingMinutes > 0 && <WalkTimeBadge minutes={walkingMinutes} />}
              <StationBadge name={startStation.name} />
              {endStation && <StationBadge name={endStation.name} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RouteSelectContainer;
