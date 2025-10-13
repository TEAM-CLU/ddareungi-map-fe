import RouteProgressStepBar from '@/features/routing/components/RouteProgressStepBar';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import StationBadge from '@/shared/components/badge/StationBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import WalkTimeBadge from '@/shared/components/badge/WalkTimeBadge';
import { tw } from '@/shared/libs/tw-helper';
import { View, Text, TouchableOpacity } from 'react-native';

const RouteSelectContainer = () => {
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
          1시간 12분
        </Text>
        <Text
          style={[
            tw('font-primary-500 text-on-surface-primary text-left'),
            { fontSize: 12 },
          ]}
        >
          오전 9:48 - 오전 10:57
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
