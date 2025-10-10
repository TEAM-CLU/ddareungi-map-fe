import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import {
  IconOval,
  IconSwitch,
  IconClose,
  IconPlus,
  IconMinus,
} from '@/shared/components/icons';

export enum RouteType {
  CONSTANT = 'constant',
  LOOP = 'loop',
}

export interface RoutePoint {
  id: string;
  placeholder: string;
  value: string;
  type: 'start' | 'waypoint' | 'end';
}

interface RouteInputBarProps {
  routeType: RouteType;
  onClose: () => void;
  onRoutePointPress: (point: RoutePoint) => void;
  onSwapStartEnd?: () => void;
  routeData?: { [key: string]: AutocompleteResult };
}

const RouteInputBar = ({
  routeType,
  onClose,
  onRoutePointPress,
  onSwapStartEnd,
  routeData = {},
}: RouteInputBarProps) => {
  const [internalRouteData, setInternalRouteData] = useState(routeData);

  // routeData가 변경될 때마다 internalRouteData 동기화
  useEffect(() => {
    setInternalRouteData(routeData);
  }, [routeData]);

  // routeType이 변경될 때마다 waypoints 상태 동기화
  useEffect(() => {
    if (routeType === RouteType.LOOP && waypoints.length === 0) {
      // loop 모드로 변경 시 경유지가 없으면 기본 경유지 1개 추가
      setWaypoints([
        {
          id: 'waypoint-1',
          placeholder: '경유지',
          value: routeData['waypoint-1']?.name || '',
          type: 'waypoint',
        },
      ]);
    } else if (routeType === RouteType.CONSTANT && waypoints.length > 0) {
      // constant 모드로 변경 시 모든 경유지 제거
      setWaypoints([]);
    }
  }, [routeType, routeData]);

  const [waypoints, setWaypoints] = useState<RoutePoint[]>(
    routeType === RouteType.LOOP
      ? [
          {
            id: 'waypoint-1',
            placeholder: '경유지',
            value: routeData['waypoint-1']?.name || '',
            type: 'waypoint',
          },
        ]
      : [],
  );

  // 출발지와 도착지 교환 함수
  const handleSwapPress = useCallback(() => {
    setInternalRouteData(prev => ({
      ...prev,
      start: prev.end,
      end: prev.start,
    }));

    // 외부 콜백도 호출
    if (onSwapStartEnd) {
      onSwapStartEnd();
    }
  }, [onSwapStartEnd]);

  const startPoint: RoutePoint = {
    id: 'start',
    placeholder: '출발지',
    value: internalRouteData['start']?.name || '',
    type: 'start',
  };

  const endPoint: RoutePoint = {
    id: 'end',
    placeholder: '도착지',
    value: internalRouteData['end']?.name || '',
    type: 'end',
  };

  const handleAddWaypointPress = useCallback(() => {
    if (waypoints.length < 3) {
      // 기존 경유지 ID들을 확인하여 중복되지 않는 ID 생성
      const existingIds = waypoints.map(w => parseInt(w.id.split('-')[1]));
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

      const newWaypoint: RoutePoint = {
        id: `waypoint-${maxId + 1}`,
        placeholder: '경유지',
        value: '',
        type: 'waypoint',
      };
      setWaypoints(prev => [...prev, newWaypoint]);
    }
  }, [waypoints]);

  // RouteInputBar 닫기 및 데이터 초기화
  const handleClosePress = useCallback(() => {
    // waypoints 초기화
    setWaypoints(
      routeType === RouteType.LOOP
        ? [
            {
              id: 'waypoint-1',
              placeholder: '경유지',
              value: '',
              type: 'waypoint',
            },
          ]
        : [],
    );

    // 부모 컴포넌트의 onClose 호출
    onClose();
  }, [routeType, onClose]);

  const handleRemoveWaypointPress = useCallback(
    (waypointId: string) => {
      // loop 모드일 때는 경유지가 1개 이하로 내려가지 않도록 제한
      if (routeType === RouteType.LOOP && waypoints.length <= 1) {
        return;
      }
      setWaypoints(prev => prev.filter(w => w.id !== waypointId));
    },
    [routeType, waypoints.length],
  );

  return (
    <View
      style={tw(
        'bg-white rounded-xl overflow-hidden mx-4 border border-line-default',
      )}
    >
      {/* 메인 입력 영역 */}
      <View style={tw('relative')}>
        {/* 좌측 스위치 버튼 */}
        <View style={tw('absolute left-2 top-0 bottom-0 justify-center z-10')}>
          <TouchableOpacity
            onPress={handleSwapPress}
            style={tw('w-8 h-8 items-center justify-center')}
          >
            <IconSwitch />
          </TouchableOpacity>
        </View>

        {/* 우측 닫기 버튼 - 경유지가 있을 때만 컨테이너 중앙에 위치 */}
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

        {/* 경유지가 없을 때 우측 버튼들 - + 버튼과 x 버튼 */}
        {waypoints.length === 0 && (
          <>
            {/* + 버튼 */}
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

            {/* x 버튼 */}
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

        {/* 인풋 필드들 - 닫기 버튼 영역을 피하기 위한 패딩 */}
        <View style={tw('pl-12 pr-10 py-3')}>
          {/* 출발지 */}
          <View
            style={tw(
              'relative flex-row items-center py-1 border-b border-line-default',
            )}
          >
            {/* 좌측 아이콘 */}
            <View style={tw('w-6 mr-1 items-center')}>
              <IconOval
                width={20}
                height={20}
                color={waypoints.length > 0 ? 'gray' : 'brand'}
              />
            </View>

            {/* 입력 필드 */}
            <TouchableOpacity
              style={tw('flex-1')}
              onPress={() => onRoutePointPress(startPoint)}
            >
              <Text
                style={tw(
                  internalRouteData['start']?.name || startPoint.value
                    ? 'text-on-surface-primary font-primary-500 text-base'
                    : 'text-on-surface-placeholder font-primary-500 text-base',
                )}
              >
                {internalRouteData['start']?.name ||
                  startPoint.value ||
                  startPoint.placeholder}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 경유지들 */}
          {waypoints.map((waypoint, index) => (
            <View
              key={waypoint.id}
              style={tw(
                'flex-row items-center py-1.5 border-b border-line-default',
              )}
            >
              {/* 좌측 아이콘 */}
              <View style={tw('w-6 mr-1 items-center')}>
                <IconOval width={20} height={20} color="brand" />
              </View>

              {/* 입력 필드 */}
              <TouchableOpacity
                style={tw('flex-1')}
                onPress={() => onRoutePointPress(waypoint)}
              >
                <Text
                  style={tw(
                    routeData[waypoint.id]?.name || waypoint.value
                      ? 'text-on-surface-primary font-primary-500 text-base'
                      : 'text-on-surface-placeholder font-primary-500 text-base',
                  )}
                >
                  {routeData[waypoint.id]?.name ||
                    waypoint.value ||
                    waypoint.placeholder}
                </Text>
              </TouchableOpacity>

              {/* 우측 삭제 버튼 - loop 모드에서 경유지가 1개일 때는 숨김 */}
              {!(routeType === RouteType.LOOP && waypoints.length <= 1) && (
                <TouchableOpacity
                  style={[
                    tw('ml-3 w-6 h-6 items-center justify-center rounded-full'),
                    { backgroundColor: '#D1D1D1' },
                  ]}
                  onPress={() => handleRemoveWaypointPress(waypoint.id)}
                >
                  <IconMinus width={20} color="white" />
                </TouchableOpacity>
              )}

              {/* + 버튼 - loop 모드에서 경유지가 1개일 때만 첫 번째 경유지 옆에 표시 */}
              {routeType === RouteType.LOOP &&
                waypoints.length === 1 &&
                index === 0 &&
                waypoints.length < 3 && (
                  <TouchableOpacity
                    style={tw(
                      'ml-3 w-6 h-6 items-center justify-center bg-brand-primary rounded-full',
                    )}
                    onPress={handleAddWaypointPress}
                  >
                    <IconPlus />
                  </TouchableOpacity>
                )}
            </View>
          ))}

          {/* 도착지 */}
          <View style={tw('flex-row items-center py-1')}>
            {/* 좌측 아이콘 */}
            <View style={tw('w-6 mr-1 items-center')}>
              <IconOval width={20} height={20} color="gray" />
            </View>

            {/* 입력 필드 */}
            <TouchableOpacity
              style={tw('flex-1')}
              onPress={() => onRoutePointPress(endPoint)}
            >
              <Text
                style={tw(
                  internalRouteData['end']?.name || endPoint.value
                    ? 'text-on-surface-primary font-primary-500 text-base'
                    : 'text-on-surface-placeholder font-primary-500 text-base',
                )}
              >
                {internalRouteData['end']?.name ||
                  endPoint.value ||
                  endPoint.placeholder}
              </Text>
            </TouchableOpacity>

            {/* + 버튼 - 경유지가 2개 이상이거나 constant 모드일 때 도착지 우측에 표시 */}
            {((routeType === RouteType.LOOP && waypoints.length >= 2) ||
              (routeType === RouteType.CONSTANT && waypoints.length > 0)) &&
              waypoints.length < 3 && (
                <TouchableOpacity
                  style={tw(
                    'w-6 h-6 items-center justify-center bg-brand-primary rounded-full',
                  )}
                  onPress={handleAddWaypointPress}
                >
                  <IconPlus />
                </TouchableOpacity>
              )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default RouteInputBar;
