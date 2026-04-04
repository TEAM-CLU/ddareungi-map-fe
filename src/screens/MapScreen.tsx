import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import MyLocationButton from '@/features/location/components/MyLocationButton';
import StationMarkersToggleBtn from '@/features/station/components/StationMarkersToggleBtn';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import SelectedRouteDetailBadge from '@/features/routing/components/SelectedRouteDetailBadge';
import { useMapOrchestrator } from '@/shared/hooks/useMapOrchestrator';
import { useSearchOrchestrator } from '@/features/search/hooks/useSearchOrchestrator';
import BookmarkMarkersToggleButton from '@/features/bookmark/components/BookmarkMarkersToggleButton';
import ReturnToRouteSelectButton from '@/features/routing/components/ReturnToRouteSelectButton';
import NavigationController from '@/features/navigation/components/NavigationController';
import InstructionBanner from '@/features/navigation/components/InstructionBanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationOrchestrator } from '@/features/navigation/hooks/useNavigationOrchestrator';
import NavVolumeToggleButton from '@/features/navigation/components/NavVolumeToggleButton';
import NorthIndicator from '@/features/navigation/components/NorthIndicator';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';
import SimpleLoading from '@/shared/components/SimpleLoading';
import { useMapStore } from '@/features/map/stores/useMapStore';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { getRouteCategoryText } from '@/shared/utils/formatting';
import { makeSegmentColors } from '@/features/navigation/utils/makeSegmentColors';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';

const MapScreen = () => {
  const { navigation } = useAppNavigation();

  const {
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleCloseSelectedRouteDetailModal,
    handleOpenBookmarkModal,
    handleMapReadyMessage,
  } = useMapOrchestrator({ navigation });

  // ─────────────────────────────────────────────
  // 초기 로딩 오버레이
  // isMapReady(Zustand) + 첫 GPS 좌표 수신 완료 시 페이드아웃
  // ─────────────────────────────────────────────
  const isMapReady = useMapStore(state => state.isMapReady);
  const locationMetaData = useMyPositionStore(state => state.locationMetaData);
  const isMapPositioned = isMapReady && !!locationMetaData?.coordinate;

  const [isMapLoadingVisible, isMapLoadingVisibleSet] = useState(true);
  const mapLoadingOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isMapPositioned) return;
    Animated.timing(mapLoadingOpacityAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => isMapLoadingVisibleSet(false));
  }, [isMapPositioned, mapLoadingOpacityAnim]);

  const {
    pathDataListByInterval,
    currentTtsUrl,
    currentIntervalIndex,
    previewInstructionText,
    previewTtsUrl,
    previewSign,
    isNavigationMode,
    routeId,
    currentInstruction,
    eta,
    remainingDistanceMeter,
    traveledDistanceMeter,
    isLoadingForOffRoute,
  } = useNavigationOrchestrator();

  useBlockBackNavigation(true);

  const showSelectedRouteDetailModal = useModalStore(
    state => state.showSelectedRouteDetailModal,
  );

  const selectedRouteData = useRouteStore(state => state.selectedRouteData);
  const routeType = useRouteStore(state => state.routeType);

  const {
    handleCloseSearchPress,
    handleSearchPlacePress,
    handlePlaceSelectionFlow,
  } = useSearchOrchestrator({
    navigation,
  });

  const formattedRouteCategory = getRouteCategoryText(
    selectedRouteData?.routeCategory ?? '',
  );

  const waypointCount = selectedRouteData?.waypoints?.length ?? 0;
  const effectiveWaypointCount =
    routeType === 'loop' && waypointCount === 1 ? 0 : waypointCount;
  const segmentColors = makeSegmentColors(effectiveWaypointCount);

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map onMessage={handleMapReadyMessage} />

      {isLoadingForOffRoute && <SimpleLoading title="경로 재탐색 중" />}

      {/* 네비게이션 모드 */}
      {isNavigationMode && !!routeId && !!currentInstruction && (
        <SafeAreaView
          edges={['top']}
          style={[
            tw(
              'absolute top-0 left-0 right-0 flex justify-center items-center w-full',
            ),
          ]}
        >
          <InstructionBanner
            pathDataListByInterval={pathDataListByInterval}
            currentTtsUrl={currentTtsUrl}
            currentIntervalIndex={currentIntervalIndex}
            currentInstructionText={currentInstruction.text}
            previewTtsUrl={previewTtsUrl}
            previewInstructionText={previewInstructionText}
            currentSign={currentInstruction.sign}
            previewSign={previewSign}
            isLoading={isLoadingForOffRoute}
          />
          <View
            style={[
              tw('absolute flex-row items-center justify-start left-5 px-2.5 py-1.5 border border-gray-200'),
              {
                top: 158,
                gap: 6,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 14,
              },
            ]}
          >
            {segmentColors.map((color, segIdx) => (
              <View
                key={segIdx}
                style={tw('flex-row items-center px-2 py-1 rounded-full bg-white border border-gray-200')}
              >
                <View
                  style={[tw('w-2 h-2 rounded-full mr-1.5'), { backgroundColor: color }]}
                />
                <Text style={[tw('font-primary-600'), { fontSize: 11 }]}>
                  {segIdx + 1}
                </Text>
              </View>
            ))}
          </View>
        </SafeAreaView>
      )}

      {isNavigationMode && !!routeId && (
        <SafeAreaView
          edges={['bottom']}
          style={tw(
            'absolute bottom-0 left-0 right-0 flex justify-center items-center w-full',
          )}
        >
          <NavigationController
            estimatedArrivalTime={eta}
            remainingDistance={remainingDistanceMeter}
            traveledDistance={traveledDistanceMeter}
          />
        </SafeAreaView>
      )}

      {isNavigationMode && (
        <>
          <View style={[tw('absolute right-3'), { bottom: '24%' }]}>
            <NavVolumeToggleButton />
          </View>
          <View style={[tw('absolute right-3'), { bottom: '36%' }]}>
            <NorthIndicator />
          </View>
        </>
      )}

      {/* 경로 선택 모드 */}
      {showSelectedRouteDetailModal &&
        selectedRouteData &&
        !isNavigationMode && (
          <View
            style={[
              tw(
                'absolute top-12 left-4 flex flex-row justify-start items-center',
              ),
              { zIndex: 10, gap: 8 },
            ]}
          >
            <ReturnToRouteSelectButton
              onPress={handleCloseSelectedRouteDetailModal}
            />
            <SelectedRouteDetailBadge
              existText={formattedRouteCategory}
              textColor="#01DA86"
            />
            <SelectedRouteDetailBadge
              value={selectedRouteData.summary.time}
              textColor={'#414548'}
              type="time"
            />
            <SelectedRouteDetailBadge
              value={selectedRouteData.summary.distance}
              textColor={'#414548'}
              type={'distance'}
            />
          </View>
        )}

      {/* 기본 모드 */}
      {!showSelectedRouteDetailModal && !isNavigationMode && (
        <SearchOverlay
          onPress={handleSearchPlacePress}
          onClose={handleCloseSearchPress}
          onPlaceSelect={handlePlaceSelectionFlow}
        />
      )}

      {!isNavigationMode && (
        <Footer
          setIsStationBtnPressed={handleOpenNearbyStationModal}
          setIsRouteRecommendBtnPressed={handleOpenRouteRecommendModal}
          setIsBookmarkBtnPressed={handleOpenBookmarkModal}
        />
      )}
      {/* 공용 */}
      <View
        style={[
          tw('absolute right-3'),
          { bottom: showSelectedRouteDetailModal ? '80%' : '30%' },
        ]}
      >
        <MyLocationButton />
      </View>

      {!showSelectedRouteDetailModal && !isNavigationMode && (
        <View style={[tw('absolute right-3'), { bottom: '24%' }]}>
          <StationMarkersToggleBtn />
        </View>
      )}

      {!showSelectedRouteDetailModal && !isNavigationMode && (
        <View style={[tw('absolute right-3'), { bottom: '18%' }]}>
          <BookmarkMarkersToggleButton />
        </View>
      )}

      {/* ── 초기 로딩 오버레이: 맵 준비 + 첫 위치 수신 전까지 표시 ── */}
      {isMapLoadingVisible && (
        <Animated.View
          pointerEvents="none"
          style={[
            tw('absolute top-0 left-0 right-0 bottom-0 bg-surface-primary items-center justify-center z-10'),
            { gap: 12, opacity: mapLoadingOpacityAnim },
          ]}
        >
          <ActivityIndicator size="large" color="#01DA86" />
          <Text style={[tw('text-on-surface-primary font-primary-500'), { fontSize: 18 }]}>
            지도를 불러오는 중...
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default MapScreen;
