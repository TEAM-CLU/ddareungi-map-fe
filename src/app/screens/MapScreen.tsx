import React from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import { useNavigationStore } from '@/features/navigation/stores/useNavigationStore';
import InstructionBanner from '@/features/navigation/components/InstructionBanner';
import NavigationController from '@/features/navigation/components/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';

const MapScreen = () => {
  const {
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
    handleMapReadyMessage,
    isLocalMapReady,
    setIsLocalMapReady,
  } = useMapOrchestrator();

  const { canStartNavigation, routeId } = useNavigationStore();
  const { showSelectedRouteDetailModal } = useModalStore();
  const { selectedRouteData } = useRouteStore();
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

      {canStartNavigation && !!routeId && (
        <SafeAreaView
          edges={['top']}
          style={[
            tw(
              'absolute top-0 left-0 right-0 flex justify-center items-center w-full',
            ),
          ]}
        >
          <InstructionBanner instruction="앞으로 200m 직진하세요." sign={0} />
        </SafeAreaView>
      )}

      {showSelectedRouteDetailModal &&
        selectedRouteData &&
        !canStartNavigation && (
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

      {/* 검색 오버레이 */}
      {!showSelectedRouteDetailModal && !canStartNavigation && (
        <SearchOverlay
          onPress={handleSearchbarPress}
          onClose={handleSearchClose}
          onPlaceSelect={handlePlaceSelectionFlow}
        />
      )}

      <View
        style={[
          tw('absolute right-3'),
          { bottom: showSelectedRouteDetailModal ? '80%' : '30%' },
        ]}
      >
        <MyLocationButton />
      </View>

      {!showSelectedRouteDetailModal && (
        <View style={[tw('absolute right-3'), { bottom: '24%' }]}>
          <StationMarkersToggleBtn />
        </View>
      )}

      {canStartNavigation && !!routeId && (
        <SafeAreaView
          edges={['bottom']}
          style={tw(
            'absolute bottom-0 left-0 right-0 flex justify-center items-center w-full',
          )}
        >
          <NavigationController />
        </SafeAreaView>
      )}

      {!canStartNavigation && (
        <Footer
          setIsStationButtonPressed={handleOpenNearbyStationModal}
          setIsRouteRecommendBtnPressed={handleOpenRouteRecommendModal}
        />
      )}
    </View>
  );
};

export default MapScreen;
