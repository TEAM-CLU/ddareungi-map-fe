import { useCallback, useMemo } from 'react';
import { RoutePoint } from '../../model/routing.types';
import { useRouteStore } from '../../stores/useRouteStore';
import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { IconClose, IconOval } from '@/shared/components/icons';
import { createStartPoint } from '@/features/routing/utils/creatPoint';
import { useShallow } from 'zustand/react/shallow';

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

  const handleClosePress = useCallback(() => {
    onClose();
  }, [onClose]);

  const startPoint = useMemo(
    () => createStartPoint(start?.name || ''),
    [start],
  );

  return (
    <View
      style={tw(
        'bg-surface-primary rounded-xl overflow-hidden border border-line-default',
      )}
    >
      {/* 메인 입력 영역 */}
      <View style={tw('relative')}>
        {/* 닫기 버튼 */}
        <View
          style={[
            tw('absolute right-2 top-0 bottom-0 justify-center'),
            { zIndex: 10 },
          ]}
        >
          <TouchableOpacity
            onPress={handleClosePress}
            style={tw('w-8 h-8 items-center justify-center')}
          >
            <IconClose color="#A7A7A7" />
          </TouchableOpacity>
        </View>

        {/* 인풋 필드 */}
        <View style={tw('pl-12 pr-12 py-2')}>
          {/* 출발지 */}
          <View
            style={tw(
              'relative flex-row items-center py-1 border-b border-line-default',
            )}
          >
            {/* 좌측 아이콘 */}
            <View style={tw('w-6 mr-1 items-center')}>
              <IconOval width={20} height={20} color="brand" />
            </View>
            {/* 입력 필드 */}
            <TouchableOpacity
              style={tw('flex-1')}
              onPress={() => onRoutePointPress(startPoint)}
            >
              <Text
                style={tw(
                  start?.name || startPoint.value
                    ? 'text-on-surface-primary font-primary-500 text-base'
                    : 'text-on-surface-placeholder font-primary-500 text-base',
                )}
              >
                {start?.name || startPoint.value || startPoint.placeholder}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 이동 거리 */}
          <View
            style={tw(
              'relative flex-row items-center py-1 border-line-default',
            )}
          >
            {/* 좌측 아이콘 */}
            <View style={tw('w-6 mr-1 items-center')}>
              <IconOval width={20} height={20} color="gray" />
            </View>
            {/* 입력 필드 */}
            <TouchableOpacity style={tw('flex-1')} onPress={onDistancePress}>
              <Text
                style={tw(
                  distance !== null && distance > 0
                    ? 'text-on-surface-primary font-primary-500 text-base'
                    : 'text-on-surface-placeholder font-primary-500 text-base',
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
    </View>
  );
};

export default RouteRecommendInputBar;
