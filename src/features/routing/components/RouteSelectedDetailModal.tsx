import { ActivityIndicator, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import CalorieBadge from '@/shared/components/badge/CalorieBadge';
import TreeBadge from '@/shared/components/badge/TreeBadge';
import { IconSpotMarker } from '@/shared/components/icons';
import { ScrollView } from 'react-native-gesture-handler';
import RouteProgressStepVerticalBar from '@/features/routing/components/RoutePrgressStepVerticalBar';
import RoundButton from '@/shared/components/button/RoundButton';
import { Route, Waypoint } from '../model/routing.types';
import {
  formatDistance,
  formatMinutes,
  formatTime,
  formatTimeRange,
  getCategoryText,
} from '@/shared/utils/formatting';
import React, { useEffect } from 'react';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useRoutingMessenger } from '@/features/routing/hooks/useRoutingMessenger';
import {
  DrawStaticPathMessage,
  StaticPathData,
} from '@/shared/model/map.webview.types';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useLocationStore } from '@/features/location/stores/useLocationStore';
import { useLocationMessenger } from '@/features/location/hooks/useLocationMessenger';

interface RouteSelectedDetailModalProps {
  selectedRouteData: Route | null;
  startAddress: string | undefined;
  endAddress: string | undefined;
  waypoints?: Waypoint[];
  baseTime?: Date;
}

const RouteSelectedDetailModal = ({
  selectedRouteData,
  startAddress,
  endAddress,
  waypoints,
  baseTime = new Date(),
}: RouteSelectedDetailModalProps) => {
  if (!selectedRouteData) {
    return (
      <View style={tw('flex justify-center w-full flex-1 items-center')}>
        <ActivityIndicator size="large" color="#C4C4C4" />
      </View>
    );
  }

  const { totalCaloriesBurned, totalTrees, routeType } = useRouteStore();
  const { drawStaticPath, focusOnStaticPath } = useRoutingMessenger();
  const { setLocationMode } = useLocationStore();
  const { myLocationCompassOff } = useLocationMessenger();
  const { isMapReady } = useMapStore();
  const {
    summary,
    segments,
    startStation,
    endStation,
    routeCategory,
    waypoints: wpArr,
    coordinates,
  } = selectedRouteData;

  const time = formatTime(summary.time);
  const distance = formatDistance(summary.distance);
  const timeRange = formatTimeRange(baseTime, summary.time);
  const formattedRouteCategory = getCategoryText(routeCategory);

  const firstWalkingSegment = segments.find(seg => seg.type === 'walking');
  const lastWalkingSegment = segments
    .slice()
    .reverse()
    .find(seg => seg.type === 'walking');

  const bikingSegments = segments.filter(s => s.type === 'biking');
  const totalBikingDistance = bikingSegments.reduce(
    (acc, seg) => acc + seg.summary.distance,
    0,
  );
  const totalBikingTime = bikingSegments.reduce(
    (acc, seg) => acc + seg.summary.time,
    0,
  );

  const waypointsCount = waypoints ? waypoints.length : 0;

  useEffect(() => {
    if (!isMapReady) return;
    const handleRoutePress = () => {
      const message: StaticPathData = {
        routeType: routeType,
        startPoint: coordinates[0],
        endPoint: coordinates[coordinates.length - 1],
        waypoints: wpArr ? wpArr : null,
        startStationPoint: startStation
          ? {
              lat: startStation.lat,
              lng: startStation.lng,
            }
          : null,
        endStationPoint: endStation
          ? {
              lat: endStation.lat,
              lng: endStation.lng,
            }
          : null,
        pathCoordinates: coordinates,
      };
      drawStaticPath(message);
      myLocationCompassOff();
      myLocationCompassOff();
    };

    handleRoutePress();
  }, [
    drawStaticPath,
    routeType,
    coordinates,
    wpArr,
    isMapReady,
    focusOnStaticPath,
  ]);

  return (
    <ScrollView
      contentContainerStyle={[
        tw('w-full flex flex-col flex-1 bg-surface-primary justify-start'),
        { gap: 13, paddingBottom: 40 },
      ]}
    >
      <View style={[tw('flex flex-col items-start w-full'), { gap: 16 }]}>
        <Text
          style={[tw('font-primary-700 text-brand-primary'), { fontSize: 14 }]}
        >
          {formattedRouteCategory}
        </Text>
        <View style={[tw('flex flex-col items-start'), { gap: 8 }]}>
          <Text
            style={[
              tw('font-primary-700 text-on-surface-primary'),
              { fontSize: 26 },
            ]}
          >
            {time}
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-primary'),
              { fontSize: 14 },
            ]}
          >
            {timeRange}
          </Text>
        </View>
        <View
          style={[tw('flex flex-row items-center justify-start'), { gap: 10 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 17 },
            ]}
          >
            {distance}
          </Text>
          <CalorieBadge value={totalCaloriesBurned ?? 0} />
          <TreeBadge value={totalTrees ?? 0} />
        </View>
      </View>

      {/* 구분선 */}
      <View style={[tw('w-full'), { height: 1, backgroundColor: '#D8D8D8' }]} />

      {/* 경로 상세 */}
      <View
        style={[tw('w-full flex-1 flex flex-col justify-start'), { gap: 28 }]}
      >
        {/* 출발지 */}
        <View
          style={[tw('flex flex-row items-center justify-start'), { gap: 14 }]}
        >
          <IconSpotMarker
            color={'#006AFF'}
            width={23}
            height={28}
            label={'출발'}
            fontSize={10}
          />
          <Text style={[tw('font-primary-700 text-black'), { fontSize: 17 }]}>
            {startAddress}
          </Text>
        </View>

        {/* route */}
        <View
          style={[
            tw('flex flex-row flex-1 justify-start'),
            { gap: 14, paddingLeft: 5.5 },
          ]}
        >
          <RouteProgressStepVerticalBar />

          <View style={tw('flex flex-col justify-between flex-1')}>
            {firstWalkingSegment && (
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-quaternary'),
                  { fontSize: 15, marginBottom: 22 },
                ]}
              >
                {'대여소까지 도보로 '}
                {formatDistance(firstWalkingSegment.summary.distance)}
                <Text
                  style={[tw('font-primary-500 text-black'), { fontSize: 15 }]}
                >
                  {formatMinutes(firstWalkingSegment.summary.time)}분
                </Text>
              </Text>
            )}

            {startStation && (
              <View
                style={[
                  tw('flex flex-col w-full'),
                  { gap: 6, marginBottom: 22 },
                ]}
              >
                <View
                  style={[
                    tw('w-full'),
                    { height: 1, backgroundColor: '#D8D8D8' },
                  ]}
                />
                <Text
                  style={[tw('font-primary-600 text-black'), { fontSize: 15 }]}
                >
                  {startStation.number}. {startStation.name}에서 자전거 탑승
                </Text>
              </View>
            )}

            {bikingSegments.length > 0 && (
              <View
                style={[
                  tw('flex flex-col w-full'),
                  { gap: 6, marginBottom: 22 },
                ]}
              >
                <Text
                  style={[
                    tw('font-primary-500 text-on-surface-quaternary'),
                    { fontSize: 15 },
                  ]}
                >
                  {'자전거로 '}
                  {formatDistance(totalBikingDistance)}
                  <Text
                    style={[
                      tw('font-primary-500 text-black'),
                      { fontSize: 15 },
                    ]}
                  >
                    {' '}
                    {formatMinutes(totalBikingTime)}분
                  </Text>
                </Text>
                {/* 경유지가 있을 경우에만 표시 */}
                {waypointsCount > 0 && (
                  <Text
                    style={[
                      tw('font-primary-500 text-brand-primary'),
                      { fontSize: 14, marginTop: 4 },
                    ]}
                  >
                    (경유지 {waypointsCount}곳 포함)
                  </Text>
                )}
              </View>
            )}

            {endStation && (
              <View
                style={[
                  tw('flex flex-col w-full'),
                  { gap: 6, marginBottom: 22 },
                ]}
              >
                <Text
                  style={[tw('font-primary-600 text-black'), { fontSize: 15 }]}
                >
                  {endStation.number}. {endStation.name}에서 자전거 하차
                </Text>
                <View
                  style={[
                    tw('w-full'),
                    { height: 1, backgroundColor: '#D8D8D8' },
                  ]}
                />
              </View>
            )}

            {lastWalkingSegment &&
              lastWalkingSegment !== firstWalkingSegment && (
                <Text
                  style={[
                    tw('font-primary-500 text-on-surface-quaternary'),
                    { fontSize: 15 },
                  ]}
                >
                  {'목적지까지 도보로 '}
                  {formatDistance(lastWalkingSegment.summary.distance)}
                  <Text
                    style={[
                      tw('font-primary-500 text-black'),
                      { fontSize: 15 },
                    ]}
                  >
                    {formatMinutes(lastWalkingSegment.summary.time)}분
                  </Text>
                </Text>
              )}
          </View>
        </View>

        {/* 도착지 */}
        <View
          style={[tw('flex flex-row items-center justify-start'), { gap: 14 }]}
        >
          <IconSpotMarker
            color={'#FF0000'}
            width={23}
            height={28}
            label={'도착'}
            fontSize={10}
          />
          <Text style={[tw('font-primary-700 text-black'), { fontSize: 17 }]}>
            {endAddress}
          </Text>
        </View>
      </View>

      <RoundButton preset="lg" title="안내 시작하기" onPress={() => {}} />
    </ScrollView>
  );
};
export default RouteSelectedDetailModal;
