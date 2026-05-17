import { tw } from '@/shared/libs/tw-helper';
import {
  formatTimeHMText,
  formatDistanceAdaptiveText,
  formatCaloriesKcalText,
} from '@/shared/utils/formatting';
import { Text, View } from 'react-native';

interface UsageCardProps {
  totalTime: number;
  totalDistance: number;
  calories: number;
}

const UsageCard = ({ totalTime, totalDistance, calories }: UsageCardProps) => {
  const timeText = formatTimeHMText(totalTime);
  const distanceText = formatDistanceAdaptiveText(totalDistance);
  const calorieText = formatCaloriesKcalText(calories);

  return (
    <View
      style={tw(
        'w-full h-[180px] border border-brand-primary bg-surface-primary shadow-sm rounded-xl overflow-hidden',
      )}
    >
      {/* 상단 헤더 */}
      <View style={tw('w-full bg-brand-primary px-5 py-3 items-start')}>
        <Text style={tw('font-primary-700 text-lg text-on-surface-secondary')}>
          총 이용이력
        </Text>
      </View>

      {/* 하단 내용 */}
      <View style={tw('px-5 py-4')}>
        <View style={tw('flex-row justify-between mb-3')}>
          <Text
            style={tw('text-on-surface-primary font-primary-500 text-base')}
          >
            이용시간
          </Text>
          <Text
            style={tw('text-on-surface-primary font-primary-700 text-base')}
          >
            {timeText}
          </Text>
        </View>

        <View style={tw('flex-row justify-between mb-3')}>
          <Text
            style={tw('text-on-surface-primary font-primary-500 text-base')}
          >
            거리
          </Text>
          <Text
            style={tw('text-on-surface-primary font-primary-700 text-base')}
          >
            {distanceText}
          </Text>
        </View>

        <View style={tw('flex-row justify-between')}>
          <Text
            style={tw('text-on-surface-primary font-primary-500 text-base')}
          >
            칼로리
          </Text>
          <Text
            style={tw('text-on-surface-primary font-primary-700 text-base')}
          >
            {calorieText}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default UsageCard;
