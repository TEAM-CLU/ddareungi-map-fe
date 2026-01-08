import React from 'react';
import { View } from 'react-native';
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
import { getCategoryText } from '@/shared/utils/formatting';
import ReturnToRouteSelectButton from '@/features/routing/components/ReturnToRouteSelectButton';
import InstructionBanner from '@/features/navigation/components/InstructionBanner';
import NavigationController from '@/features/navigation/components/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import BookmarkMarkersToggleButton from '@/shared/components/bookmark/BookmarkMarkersToggleButton';
import { useNavigationOrchestrator } from '@/features/navigation/hooks/useNavigationOrchestrator';
import NavVolumeToggleButton from '@/features/navigation/components/NavVolumeToggleButton';
import NorthIndicator from '@/features/navigation/components/NorthIndicator';

const MapScreen = () => {
  const {
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
    handleOpenBookmarkModal,
    handleMapReadyMessage,
    isLocalMapReady,
    setIsLocalMapReady,
  } = useMapOrchestrator();

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
  } = useNavigationOrchestrator();

  const showSelectedRouteDetailModal = useModalStore(
    state => state.showSelectedRouteDetailModal,
  );
  const selectedRouteData = useRouteStore(state => state.selectedRouteData);
  const { handleSearchbarPress, handleSearchClose, handlePlaceSelectionFlow } =
    useSearchOrchestrator();

  const formattedRouteCategory = getCategoryText(
    selectedRouteData?.routeCategory ?? '',
  );

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map
        isLocalMapReady={isLocalMapReady}
        setIsLocalMapReady={setIsLocalMapReady}
        handleMapReadyMessage={handleMapReadyMessage}
      />

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
          />
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
              onPress={handleSelectedRouteDetailModalClose}
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
          onPress={handleSearchbarPress}
          onClose={handleSearchClose}
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
    </View>
  );
};

export default MapScreen;
