import RouteProgressStepBar from '@/features/routing/components/RouteProgressStepBar';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import StationBadge from '@/shared/components/badge/StationBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import WalkTimeBadge from '@/shared/components/badge/WalkTimeBadge';
import { tw } from '@/shared/libs/tw-helper';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { Route, RouteResponse, Segment } from '../model/routing.types';
import {
  calculateWalkingTime,
  formatDistance,
  formatTime,
  formatTimeRange,
} from '@/shared/utils/formatting';
import {
  convertToTrees,
  measureCaloriesBurned,
  measureCarbonSaved,
} from '@/shared/utils/measure';
import { Gender } from '@/shared/model/index.types';
import { useUserInfoQuery } from '@/features/auth/services/user.queries';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';

interface RouteSelectContainerProps {
  routes?: RouteResponse | null;
  isLoading?: boolean;
  error?: string | null;
  baseTime: Date;
  onRoutePress: (
    route: Route,
    totalCaloriesBurned: number,
    totalTrees: number,
  ) => void; // RouteResponse['data'][0]
}

const RouteSelectContainer = ({
  routes,
  isLoading,
  error,
  baseTime,
  onRoutePress,
}: RouteSelectContainerProps) => {
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
    <ScrollView
      style={tw('w-full')}
      bounces={false}
      alwaysBounceVertical={false}
      contentContainerStyle={{ paddingBottom: 150 }}
    >
      {routes.data.map((route, index) => {
        const { routeCategory, summary, startStation, endStation, segments } =
          route;

        const timeText = formatTime(summary.time);
        const distanceKm = formatDistance(summary.distance);
        const walkingMinutes = Math.round(calculateWalkingTime(segments) / 60);
        const timeRange = formatTimeRange(baseTime, summary.time);
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

        // 활동 데이터 계산
        const { setTotalCaloriesBurned, setTotalTrees } = useRouteStore();
        const userGender: Gender = useUserInfoQuery().data?.data.gender;
        const caloriesBurnedWalking = measureCaloriesBurned(
          'walking',
          userGender,
          walkingMinutes,
        );
        const caloriesBurendBiking = measureCaloriesBurned(
          'biking',
          userGender,
          bikingMinutes,
        );
        const totalCaloriesBurned =
          caloriesBurnedWalking + caloriesBurendBiking;

        const walkingDistance = segments.reduce((acc, segment) => {
          if (segment.type === 'walking') {
            return acc + segment.summary.distance;
          }
          return acc;
        }, 0);

        const bikingDistance = segments.reduce((acc, segment) => {
          if (segment.type === 'biking') {
            return acc + segment.summary.distance;
          }
          return acc;
        }, 0);

        const carbonSavedBiking = measureCarbonSaved('biking', bikingDistance);

        const carbonSavedWalking = measureCarbonSaved(
          'walking',
          walkingDistance,
        );

        const totalCarbonSaved = carbonSavedBiking + carbonSavedWalking;
        const totalTrees = convertToTrees(totalCarbonSaved);

        return (
          <TouchableOpacity
            key={route.routeId || `route-${index}`}
            onPress={() => onRoutePress(route, totalCaloriesBurned, totalTrees)}
            style={[
              tw(
                'bg-surface-primary w-full px-4 py-5 flex h-full flex-col items-start justify-between border-b',
              ),
              { maxHeight: 300, borderColor: '#D8D8D8' },
            ]}
          >
            {/* 상단부 */}
            <View style={[tw('w-full flex flex-col'), { gap: 6 }]}>
              <Text
                style={[
                  tw('font-primary-700 text-brand-primary text-left'),
                  { fontSize: 14 },
                ]}
              >
                {routeCategory}
              </Text>
              <Text
                style={[
                  tw('font-primary-700 text-on-surface-primary text-left'),
                  { fontSize: 26 },
                ]}
              >
                {timeText}
              </Text>
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-primary text-left'),
                  { fontSize: 14 },
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
                    { fontSize: 17 },
                  ]}
                >
                  {distanceKm}
                </Text>
                <View style={[tw('flex flex-row items-center'), { gap: 8 }]}>
                  <CalorieBadge value={totalCaloriesBurned} />
                  <TreeBadge value={totalTrees} />
                </View>
              </View>
            </View>

            <RouteProgressStepBar
              route={route}
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
    </ScrollView>
  );
};

export default RouteSelectContainer;
