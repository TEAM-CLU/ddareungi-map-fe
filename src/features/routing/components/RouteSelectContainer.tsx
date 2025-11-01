import RouteProgressStepBar from '@/features/routing/components/RouteProgressStepBar';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import StationBadge from '@/shared/components/badge/StationBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import WalkTimeBadge from '@/shared/components/badge/WalkTimeBadge';
import { tw } from '@/shared/libs/tw-helper';
import { View, Text, TouchableOpacity } from 'react-native';
import { RouteResponse } from '../model/routing.types';

interface RouteSelectContainerProps {
  routes?: RouteResponse | null;
  isLoading?: boolean;
  error?: string | null;
}

const RouteSelectContainer = ({
  routes,
  isLoading,
  error,
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

  // 첫 번째 경로 표시 (추후 여러 경로 선택 기능 추가 가능)
  const firstRoute = routes.data[0];
  const { summary } = firstRoute;

  // 시간을 분으로 변환하여 표시
  const totalMinutes = Math.round(summary.time / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

  // 거리를 km로 변환
  const distanceKm = (summary.distance / 1000).toFixed(1);

  return (
    <TouchableOpacity
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
          가장 빠른 경로
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
          총 거리: {distanceKm}km
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
            15.2km
          </Text>
          <View style={[tw('flex flex-row items-center'), { gap: 8 }]}>
            <CalorieBadge value={143} />
            <TreeBadge value={1} />
          </View>
        </View>
      </View>
      <RouteProgressStepBar />
      <View style={[tw('w-full flex flex-col items-start'), { gap: 8 }]}>
        <WalkTimeBadge minutes={15} />
        <StationBadge name="1600. 과기대 입구" />
        <StationBadge name="1601. 과기대 정문" />
      </View>
    </TouchableOpacity>
  );
};

export default RouteSelectContainer;
