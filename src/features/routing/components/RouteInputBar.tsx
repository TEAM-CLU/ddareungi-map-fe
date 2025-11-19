import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Vibration } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
  DragEndParams,
} from 'react-native-draggable-flatlist';
import { tw } from '@/shared/libs/tw-helper';
import {
  IconOval,
  IconSwitch,
  IconClose,
  IconPlus,
  IconMinus,
} from '@/shared/components/icons';
import { RoutePoint, RouteType } from '../model/routing.types';
import IconArrowsUpDown from '@/shared/components/icons/IconArrowsUpDown';
import { useRouteStore } from '../stores/useRouteStore';
import {
  createStartPoint,
  createEndPoint,
} from '@/features/routing/utils/creatPoint';

interface RouteInputBarProps {
  onClose: () => void;
  onRoutePointPress: (point: RoutePoint) => void;
  onAddWaypointAndEdit: () => void;
}

type DraggableItem = {
  id: string;
  type: 'start' | 'end' | 'waypoint';
  point: RoutePoint;
};

const RouteInputBar = ({
  onClose,
  onRoutePointPress,
  onAddWaypointAndEdit,
}: RouteInputBarProps) => {
  const {
    routeType,
    start,
    end,
    waypoints,
    setStart,
    setEnd,
    removeWaypoint,
    reorderWaypoints,
  } = useRouteStore();

  // ✅ 드래그 중 실시간 위치 추적
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [currentDragToIndex, setCurrentDragToIndex] = useState<number | null>(
    null,
  );

  // ✅ 현재 표시 중인 아이템 순서 (드래그 완료 후에도 유지)
  const [currentItems, setCurrentItems] = useState<DraggableItem[]>([]);

  const startPoint = useMemo(
    () => createStartPoint(start?.name || ''),
    [start],
  );
  const endPoint = useMemo(() => createEndPoint(end?.name || ''), [end]);

  // ✅ 기본 아이템 배열 (Zustand 데이터 기준)
  const baseItems = useMemo((): DraggableItem[] => {
    if (waypoints.length === 0) return [];

    return [
      { id: 'start', type: 'start', point: startPoint },
      ...waypoints.map(wp => ({
        id: wp.waypointKey,
        type: 'waypoint' as const,
        point: {
          fieldKey: wp.waypointKey,
          type: 'waypoint' as const,
          value: wp.place?.name || '',
        },
      })),
      { id: 'end', type: 'end', point: endPoint },
    ];
  }, [waypoints, startPoint, endPoint]);

  // ✅ 표시할 아이템 배열 (currentItems가 있으면 사용, 없으면 baseItems)
  const draggableItems = useMemo(() => {
    if (currentItems.length === 0) {
      return baseItems;
    }

    // currentItems의 ID로 baseItems에서 최신 데이터 찾아서 업데이트
    return currentItems.map(currentItem => {
      const foundItem = baseItems.find(base => base.id === currentItem.id);
      return foundItem || currentItem;
    });
  }, [baseItems, currentItems]);

  const handleSwapPress = useCallback(() => {
    if (routeType === RouteType.LOOP) return;
    if (start && end) {
      const tempStart = start;
      setStart(end);
      setEnd(tempStart);
      setCurrentItems([]); // 순서 초기화
    }
  }, [routeType, start, end, setStart, setEnd]);

  const handleClosePress = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleAddWaypointPress = useCallback(() => {
    setCurrentItems([]); // 순서 초기화
    onAddWaypointAndEdit();
  }, [onAddWaypointAndEdit]);

  const handleRemoveWaypointPress = useCallback(
    (id: string) => {
      if (!(routeType === RouteType.LOOP && waypoints.length <= 1)) {
        removeWaypoint(id);
        setCurrentItems([]); // 순서 초기화
      }
    },
    [routeType, waypoints, removeWaypoint],
  );

  const handleDragEnd = useCallback(
    ({ data }: DragEndParams<DraggableItem>) => {
      // ✅ 드래그 상태 초기화
      setDraggingItemId(null);
      setCurrentDragToIndex(null);

      const firstItem = data[0];
      const lastItem = data[data.length - 1];

      // ✅ start가 맨 앞, end가 맨 뒤가 아니면 원상복구 (변경 무시)
      if (firstItem.type !== 'start' || lastItem.type !== 'end') {
        console.log('Start must be first and End must be last');
        // 원상복구: currentItems 초기화하여 baseItems로 돌아감
        setCurrentItems([]);
        return;
      }

      // ✅ 드래그 완료 후 현재 순서 저장
      setCurrentItems(data);

      // ✅ 경유지만 추출하여 순서 업데이트
      const waypointItems = data.filter(item => item.type === 'waypoint');

      if (waypointItems.length > 0) {
        const newWaypointOrder = waypointItems.map(item => item.id);
        reorderWaypoints(newWaypointOrder);
      }
    },
    [reorderWaypoints],
  );

  // ✅ 아이템의 현재 표시 인덱스 계산
  const getItemDisplayIndex = useCallback(
    (itemId: string, originalIndex: number): number => {
      // 드래그 중이면 실시간 위치
      if (draggingItemId === itemId && currentDragToIndex !== null) {
        return currentDragToIndex;
      }

      // 드래그 완료 후: currentItems에서 위치 찾기
      if (currentItems.length > 0) {
        const foundIndex = currentItems.findIndex(item => item.id === itemId);
        if (foundIndex !== -1) {
          return foundIndex;
        }
      }

      // 기본값
      return originalIndex;
    },
    [draggingItemId, currentDragToIndex, currentItems],
  );

  const renderDraggableItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<DraggableItem>) => {
      const originalIndex = getIndex() ?? 0;
      const currentIndex = getItemDisplayIndex(item.id, originalIndex);
      const totalItems = draggableItems.length;

      const isStart = currentIndex === 0;
      const isEnd = currentIndex === totalItems - 1;
      const isWaypoint = !isStart && !isEnd;

      const iconColor = isStart
        ? waypoints.length > 0
          ? 'gray'
          : 'brand'
        : isEnd
        ? 'gray'
        : 'brand';

      const showPlusButton = waypoints.length < 3 && isEnd;
      const showMinusButton =
        isWaypoint && !(routeType === RouteType.LOOP && waypoints.length <= 1);

      return (
        <ScaleDecorator>
          <View
            style={[
              tw('flex-row items-center'),
              { height: 48, paddingVertical: 0 },
              !isEnd && tw('border-b border-line-default'),
              isActive && {
                backgroundColor: '#F0F0F0',
                borderRadius: 4,
              },
            ]}
          >
            {/* 드래그 핸들 */}
            <View style={tw('w-8 items-center justify-center')}>
              <TouchableOpacity
                onLongPress={() => {
                  Vibration.vibrate(50);
                  setDraggingItemId(item.id);
                  setCurrentDragToIndex(originalIndex);
                  drag();
                }}
                disabled={isActive}
                style={tw('w-6 h-6 items-center justify-center')}
              >
                <IconArrowsUpDown width={13} height={13} />
              </TouchableOpacity>
            </View>

            {/* 좌측 아이콘 */}
            <View style={tw('w-6 items-center')}>
              <IconOval width={20} height={20} color={iconColor} />
            </View>

            {/* 입력 필드 */}
            <TouchableOpacity
              style={tw('flex-1 ml-1')}
              onPress={() => onRoutePointPress(item.point)}
            >
              <Text
                numberOfLines={1}
                style={tw(
                  item.point.value
                    ? 'text-on-surface-primary font-primary-500 text-base'
                    : 'text-on-surface-placeholder font-primary-500 text-base',
                )}
              >
                {item.point.value || item.point.placeholder}
              </Text>
            </TouchableOpacity>

            {/* - 버튼 (경유지 삭제) */}
            {showMinusButton && (
              <TouchableOpacity
                style={[
                  tw('ml-2 w-6 h-6 items-center justify-center rounded-full'),
                  { backgroundColor: '#D1D1D1' },
                ]}
                onPress={() => handleRemoveWaypointPress(item.id)}
              >
                <IconMinus width={20} color="white" />
              </TouchableOpacity>
            )}

            {/* + 버튼 (경유지 추가) */}
            {showPlusButton && (
              <TouchableOpacity
                style={tw(
                  'ml-2 w-6 h-6 items-center justify-center bg-brand-primary rounded-full',
                )}
                onPress={handleAddWaypointPress}
              >
                <IconPlus />
              </TouchableOpacity>
            )}
          </View>
        </ScaleDecorator>
      );
    },
    [
      waypoints,
      routeType,
      onRoutePointPress,
      handleAddWaypointPress,
      handleRemoveWaypointPress,
      draggableItems,
      getItemDisplayIndex,
    ],
  );

  return (
    <View
      style={tw(
        'bg-surface-primary rounded-xl overflow-hidden border border-line-default',
      )}
    >
      {/* 메인 입력 영역 */}
      <View style={tw('relative')}>
        {/* 좌측 스위치 버튼 - 경유지가 없을 때만 */}
        {waypoints.length === 0 && (
          <View
            style={tw('absolute left-2 top-0 bottom-0 justify-center z-10')}
          >
            <TouchableOpacity
              onPress={handleSwapPress}
              style={tw('w-8 h-8 items-center justify-center')}
            >
              <IconSwitch />
            </TouchableOpacity>
          </View>
        )}

        {/* 우측 닫기 버튼 - 경유지가 있을 때만 */}
        {waypoints.length > 0 && (
          <View
            style={tw('absolute right-2 top-0 bottom-0 justify-center z-20')}
          >
            <TouchableOpacity
              onPress={handleClosePress}
              style={tw('w-8 h-8 items-center justify-center')}
            >
              <IconClose color="#A7A7A7" />
            </TouchableOpacity>
          </View>
        )}

        {/* 경유지가 없을 때 우측 버튼들 */}
        {waypoints.length === 0 && (
          <>
            <View
              style={tw('absolute right-12 top-0 bottom-0 justify-center z-10')}
            >
              <TouchableOpacity
                style={tw(
                  'w-6 h-6 items-center justify-center bg-brand-primary rounded-full',
                )}
                onPress={handleAddWaypointPress}
              >
                <IconPlus />
              </TouchableOpacity>
            </View>

            <View
              style={tw('absolute right-2 top-0 bottom-0 justify-center z-10')}
            >
              <TouchableOpacity
                onPress={handleClosePress}
                style={tw('w-8 h-8 items-center justify-center')}
              >
                <IconClose color="#A7A7A7" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 인풋 필드들 */}
        <View style={tw(`${waypoints.length > 0 ? 'pl-2' : 'pl-12'} pr-12`)}>
          {waypoints.length === 0 ? (
            <>
              {/* 출발지 */}
              <View
                style={[
                  tw('flex-row items-center border-b border-line-default'),
                  { height: 48 },
                ]}
              >
                <View style={tw('w-6 items-center')}>
                  <IconOval width={20} height={20} color="brand" />
                </View>

                <TouchableOpacity
                  style={tw('flex-1 ml-1')}
                  onPress={() => onRoutePointPress(startPoint)}
                >
                  <Text
                    numberOfLines={1}
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

              {/* 도착지 */}
              <View style={[tw('flex-row items-center'), { height: 48 }]}>
                <View style={tw('w-6 items-center')}>
                  <IconOval width={20} height={20} color="gray" />
                </View>

                <TouchableOpacity
                  style={tw('flex-1 ml-1')}
                  onPress={() => onRoutePointPress(endPoint)}
                >
                  <Text
                    numberOfLines={1}
                    style={tw(
                      end?.name || endPoint.value
                        ? 'text-on-surface-primary font-primary-500 text-base'
                        : 'text-on-surface-placeholder font-primary-500 text-base',
                    )}
                  >
                    {end?.name || endPoint.value || endPoint.placeholder}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <DraggableFlatList
              data={draggableItems}
              onDragEnd={handleDragEnd}
              keyExtractor={item => item.id}
              renderItem={renderDraggableItem}
              scrollEnabled={false}
              activationDistance={5}
              containerStyle={{ paddingVertical: 0 }}
              nestedScrollEnabled={false}
              onPlaceholderIndexChange={placeholderIndex => {
                // ✅ 드래그 중 실시간 위치 업데이트
                if (draggingItemId !== null && placeholderIndex !== undefined) {
                  setCurrentDragToIndex(placeholderIndex);
                }
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default RouteInputBar;
