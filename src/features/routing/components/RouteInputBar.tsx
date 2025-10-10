import React, { useCallback } from 'react';
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
import { RoutePoint, RouteType } from '../model/routing.types';
import { ROUTE_CONSTANTS } from '../model/routing.constants';
import {
  createStartPoint,
  createEndPoint,
} from '../model/routing.data';
import { canRemoveWaypoint, canAddWaypoint } from '../utils/validateWaypoint';
import { useRouteInput } from '../hooks/useRouteInput';

interface RouteInputBarProps {
  routeType: RouteType;
  routeData?: { [key: string]: AutocompleteResult };
  onClose: () => void;
  onRoutePointPress: (point: RoutePoint) => void;
  onSwapStartEnd?: () => void; // 출발지/도착지 교환 버튼 클릭 시
  onRouteDataComplete?: (isComplete: boolean) => void; // 라우트 데이터 다 채워졌는지
}

const RouteInputBar = ({
  routeType,
  routeData = {},
  onClose,
  onRoutePointPress,
  onSwapStartEnd,
  onRouteDataComplete,
}: RouteInputBarProps) => {
  const {
    internalRouteData,
    setInternalRouteData,
    waypoints,
    setWaypoints,
    handleAddWaypointPress,
    handleRemoveWaypointPress,
    resetWaypoints,
  } = useRouteInput({
    routeType,
    routeData,
    onRouteDataComplete,
  });

  // 출발지와 도착지 교환 함수
  const handleSwapPress = useCallback(() => {
    setInternalRouteData(prev => ({
      ...prev,
      start: prev.end,
      end: prev.start,
    }));
    onSwapStartEnd?.();
  }, [onSwapStartEnd]);

  // RouteInputBar 닫기 및 데이터 초기화
  const handleClosePress = useCallback(() => {
    resetWaypoints();
    onClose();
  }, [resetWaypoints, onClose]);

  const startPoint: RoutePoint = createStartPoint(
    internalRouteData[ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.START]?.name ||
      '',
  );

  const endPoint: RoutePoint = createEndPoint(
    internalRouteData[ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.END]?.name || '',
  );

  return (
    <View
      style={tw(
        'bg-surface-primary rounded-xl overflow-hidden border border-line-default',
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

        {/* 인풋 필드들 */}
        <View style={tw('pl-12 pr-12 py-2')}>
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
                  internalRouteData[
                    ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.START
                  ]?.name || startPoint.value
                    ? 'text-on-surface-primary font-primary-500 text-base'
                    : 'text-on-surface-placeholder font-primary-500 text-base',
                )}
              >
                {internalRouteData[
                  ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.START
                ]?.name ||
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
                'flex-row items-center py-1 border-b border-line-default',
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
              {canRemoveWaypoint(routeType, waypoints.length) && (
                <TouchableOpacity
                  style={[
                    tw('ml-2 w-6 h-6 items-center justify-center rounded-full'),
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
                canAddWaypoint(waypoints.length) && (
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
                  internalRouteData[ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.END]
                    ?.name || endPoint.value
                    ? 'text-on-surface-primary font-primary-500 text-base'
                    : 'text-on-surface-placeholder font-primary-500 text-base',
                )}
              >
                {internalRouteData[ROUTE_CONSTANTS.DEFAULT_ROUTE_POINT_IDS.END]
                  ?.name ||
                  endPoint.value ||
                  endPoint.placeholder}
              </Text>
            </TouchableOpacity>

            {/* + 버튼 - 경유지가 2개 이상이거나 constant 모드일 때 도착지 우측에 표시 */}
            {((routeType === RouteType.LOOP && waypoints.length >= 2) ||
              (routeType === RouteType.CONSTANT && waypoints.length > 0)) &&
              canAddWaypoint(waypoints.length) && (
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
        </View>
      </View>
    </View>
  );
};

export default RouteInputBar;
