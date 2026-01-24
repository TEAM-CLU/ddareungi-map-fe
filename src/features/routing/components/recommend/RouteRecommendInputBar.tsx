import { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconClose, IconOval } from '@/shared/components/icons';
import { createStartPoint } from '@/features/routing/utils/creatPoint';
import { useShallow } from 'zustand/react/shallow';
import { RoutePoint } from '@/features/routing/model/routing.types';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';

interface RouteRecommendInputBarProps {
  onClose: () => void;
  onRoutePointPress: (point: RoutePoint) => void;
  onDistancePress: () => void;
}

const RouteRecommendInputBar = ({
  onClose,
  onRoutePointPress,
  onDistancePress,
}: RouteRecommendInputBarProps) => {
  const { start, distance } = useRouteStore(
    useShallow(state => ({
      start: state.start,
      distance: state.distance,
    })),
  );

  const startPoint = useMemo(
    () => createStartPoint(start?.name || ''),
    [start],
  );

  const handleClosePress = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <View
      style={tw(
        'relative bg-surface-primary rounded-xl overflow-hidden border border-line-default',
      )}
    >
      {/* 닫기 버튼 */}
      <View style={tw('absolute right-2 top-2 z-20')}>
        <TouchableOpacity
          onPress={handleClosePress}
          style={tw('w-8 h-8 items-center justify-center')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconClose color="#A7A7A7" />
        </TouchableOpacity>
      </View>

      {/* 인풋 영역 */}
      <View style={tw('pl-2 pr-12')}>
        {/* 출발지 */}
        <View
          style={tw(
            'flex-row items-center h-12 px-0 border-b border-line-default',
          )}
        >
          <View style={tw('w-8 items-center justify-center')}>
            <IconOval width={20} height={20} colorHex="#006AFF" />
          </View>
          <TouchableOpacity
            style={tw('flex-1 justify-center h-full')}
            onPress={() => onRoutePointPress(startPoint)}
          >
            <Text
              numberOfLines={1}
              style={tw(
                `${
                  start?.name || startPoint.value
                    ? 'text-on-surface-primary'
                    : 'text-on-surface-placeholder'
                } text-base font-medium`,
              )}
            >
              {start?.name || startPoint.value || startPoint.placeholder}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 이동 거리 */}
        <View style={tw('flex-row items-center h-12 px-0')}>
          <View style={tw('w-8 items-center justify-center')}>
            <IconOval width={20} height={20} colorHex="#6B7280" />
          </View>
          <TouchableOpacity
            style={tw('flex-1 justify-center h-full')}
            onPress={onDistancePress}
          >
            <Text
              numberOfLines={1}
              style={tw(
                `${
                  distance !== null && distance > 0
                    ? 'text-on-surface-primary'
                    : 'text-on-surface-placeholder'
                } text-base font-medium`,
              )}
            >
              {distance !== null && distance > 0
                ? `${distance}km`
                : '이동 거리를 선택하세요'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RouteRecommendInputBar;
