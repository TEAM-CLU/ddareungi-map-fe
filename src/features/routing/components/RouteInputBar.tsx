import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { tw } from '@/shared/libs/tw-helper';
import {
  IconOval,
  IconSwitch,
  IconClose,
  IconPlus,
  IconMinus,
} from '@/shared/components/icons';
import IconArrowsUpDown from '@/shared/components/icons/IconArrowsUpDown';
import { useRouteInput } from '@/features/routing/hooks/useRouteInput';
import {
  RoutePoint,
  RouteItem,
  RouteType,
} from '@/features/routing/model/routing.types';

interface RouteInputBarProps {
  onClose: () => void;
  onRoutePointPress: (point: RoutePoint) => void;
  onAddWaypointAndEdit: () => void;
}

const RouteInputBar = ({
  onClose,
  onRoutePointPress,
  onAddWaypointAndEdit,
}: RouteInputBarProps) => {
  const {
    items,
    isProcessing,
    routeType,
    start,
    end,
    hasWaypoints,
    handleDragBegin,
    handleDragEnd,
    handleSwap,
    handleRemove,
  } = useRouteInput();

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<RouteItem>) => {
      const index = getIndex() ?? 0;
      const isStart = index === 0;
      const isEnd = index === items.length - 1;
      const isWaypoint = !isStart && !isEnd;

      const waypointCount = items.length - 2;

      const iconColorHex = isStart ? '#006AFF' : isEnd ? '#FF0000' : '#01DA86';

      const showPlus = isEnd && waypointCount < 3;
      const showMinus =
        isWaypoint && !(routeType === RouteType.LOOP && waypointCount <= 1);

      const routePoint: RoutePoint = {
        fieldKey: isStart ? 'start' : isEnd ? 'end' : item.key,
        type: isStart ? 'start' : isEnd ? 'end' : 'waypoint',
        value: item.place?.name || '',
        placeholder: isStart
          ? '출발지를 입력하세요'
          : isEnd
          ? '도착지를 입력하세요'
          : '경유지를 입력하세요',
      };

      return (
        <ScaleDecorator>
          <View
            style={[
              tw('flex-row items-center h-12 px-0'),
              !isEnd && tw('border-b border-line-default'),
              isActive && {
                backgroundColor: '#F5F5F5',
                borderRadius: 8,
                zIndex: 999,
              },
            ]}
          >
            {waypointCount > 0 ? (
              <TouchableOpacity
                onLongPress={() => {
                  Vibration.vibrate(30);
                  drag();
                }}
                disabled={isActive || isProcessing}
                style={tw('w-8 h-12 items-center justify-center')}
              >
                <IconArrowsUpDown width={16} height={16} />
              </TouchableOpacity>
            ) : (
              <View style={tw('w-8 h-12 items-center justify-center')} />
            )}

            <View style={tw('w-8 items-center justify-center')}>
              <IconOval width={20} height={20} colorHex={iconColorHex} />
            </View>

            <TouchableOpacity
              style={tw('flex-1 justify-center h-full')}
              onPress={() => !isProcessing && onRoutePointPress(routePoint)}
              disabled={isProcessing}
            >
              <Text
                numberOfLines={1}
                style={[
                  tw(
                    item.place?.name
                      ? 'text-on-surface-primary text-base font-medium'
                      : 'text-on-surface-placeholder text-base',
                  ),
                ]}
              >
                {item.place?.name || routePoint.placeholder}
              </Text>
            </TouchableOpacity>

            {showMinus && (
              <TouchableOpacity
                style={tw(
                  'w-8 h-8 items-center justify-center mr-1 bg-neutral-300 rounded-full',
                )}
                onPress={() => !isProcessing && handleRemove(item.key)}
                disabled={isProcessing}
              >
                <IconMinus width={16} color="white" />
              </TouchableOpacity>
            )}

            {showPlus && (
              <TouchableOpacity
                style={tw(
                  'w-8 h-8 items-center justify-center mr-1 bg-brand-primary rounded-full',
                )}
                onPress={onAddWaypointAndEdit}
                disabled={isProcessing}
              >
                <IconPlus width={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </ScaleDecorator>
      );
    },
    [
      items.length,
      routeType,
      onRoutePointPress,
      onAddWaypointAndEdit,
      handleRemove,
      isProcessing,
    ],
  );

  return (
    <View
      style={tw(
        'relative bg-surface-primary rounded-xl overflow-hidden border border-line-default',
      )}
    >
      {/* 스왑 버튼 (경유지 없을 때만) */}
      {!hasWaypoints && (
        <View
          style={[
            tw('absolute left-2 top-0 bottom-0 justify-center'),
            { zIndex: 10 },
          ]}
        >
          <TouchableOpacity
            onPress={handleSwap}
            style={tw(
              'w-8 h-8 items-center justify-center bg-surface-primary rounded-full',
            )}
            disabled={
              routeType === RouteType.LOOP || (!start && !end) || isProcessing
            }
          >
            <IconSwitch color={!start && !end ? '#D1D1D1' : undefined} />
          </TouchableOpacity>
        </View>
      )}

      {/* 닫기 버튼 */}
      <View style={tw('absolute right-2 top-2 z-20')}>
        <TouchableOpacity
          onPress={onClose}
          style={tw('w-8 h-8 items-center justify-center')}
          disabled={isProcessing}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconClose color="#A7A7A7" />
        </TouchableOpacity>
      </View>

      {/* 리스트 영역 */}
      <View style={tw('pl-2 pr-12')}>
        <DraggableFlatList
          data={items}
          onDragBegin={handleDragBegin}
          onDragEnd={handleDragEnd}
          keyExtractor={item => item.key}
          renderItem={renderItem}
          scrollEnabled={false}
          activationDistance={5}
          containerStyle={{ paddingVertical: 0 }}
          dragItemOverflow={true}
        />
      </View>

      {/* 로딩 오버레이 */}
      {isProcessing && (
        <View
          style={[
            tw(
              'absolute inset-0 flex items-center justify-center bg-surface-primary opacity-80',
            ),
            { zIndex: 50, width: '100%', height: '100%' },
          ]}
        >
          <ActivityIndicator size="large" color="#C4C4C4" />
        </View>
      )}
    </View>
  );
};

export default RouteInputBar;
