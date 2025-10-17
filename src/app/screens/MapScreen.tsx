import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import SlideModal from '@/shared/components/modal/SlideModal';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import SearchBar from '@/features/search/components/SearchBar';
import MyLocationButton from '@/features/location/components/MyLocationButton';
import StationMarkersToggleButton from '@/features/station/components/StationMarkersToggleButton';
import StationDetailModal from '@/features/station/components/StationDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import { useMapController } from '@/shared/hooks/useMapController';

const MapScreen = () => {
  const {
    webRef,
    showSearchOverlay,
    routeType,
    selectedPlaceForModal,
    handleSearchbarPress,
    handleSearchClose,
    searchText,
    setSearchText,
    handlePlaceSelect,
    handlePlaceTypeConfirm,
    toggleRouteType,
    placeDetailModalRef,
    stationDetailModalRef,
    nearbyStationModalRef,
    myPosition,
    setMyPosition,
    stationMetaData,
    setStationMetaData,
  } = useMapController();

  ///////////

  const [isStationButtonPressed, setIsStationButtonPressed] = useState(false);

  // NearbyStationModal 오픈 처리
  useEffect(() => {
    if (isStationButtonPressed) {
      nearbyStationModalRef.current?.present();
      setIsStationButtonPressed(false);
    }
  }, [isStationButtonPressed]);

  //////////

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map
        webRef={webRef}
        setStationMetaData={setStationMetaData}
        stationDetailModalRef={stationDetailModalRef}
        setMyPosition={setMyPosition}
      />

      {/* 검색바 */}
      {!showSearchOverlay && (
        <View
          style={[
            tw('absolute top-12 left-4 right-4'),
            { elevation: 10, zIndex: 10 },
          ]}
        >
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="오늘은 어디로 갈까요?"
            onPress={handleSearchbarPress}
            readOnly={true}
          />
        </View>
      )}

      {/* 검색 오버레이 */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="오늘은 어디로 갈까요?"
      />

      <View style={[tw('absolute right-3'), { bottom: 150 }]}>
        <MyLocationButton webRef={webRef} />
      </View>

      <View style={[tw('absolute right-3'), { bottom: 100 }]}>
        <StationMarkersToggleButton webRef={webRef} />
      </View>

      <Footer setIsStationButtonPressed={setIsStationButtonPressed} />

      {/* Nearby 대여소 모달 */}
      <SlideModal
        ref={nearbyStationModalRef}
        snapPoints={['43%', '47%']}
        initialIndex={1}
        onClose={() => nearbyStationModalRef.current?.dismiss()}
      >
        <NearbyStationModal
          myPosition={myPosition}
          stationDetailModalRef={stationDetailModalRef}
          setStationMetaData={setStationMetaData}
          nearByModalRef={nearbyStationModalRef}
        />
      </SlideModal>

      {/* 대여소 상세 모달 */}
      <SlideModal
        ref={stationDetailModalRef}
        snapPoints={['43%', '47%']}
        initialIndex={1}
        onClose={() => stationDetailModalRef.current?.dismiss()}
      >
        <StationDetailModal
          myPosition={myPosition}
          stationMetaData={stationMetaData}
        />
      </SlideModal>
      {/* 장소 상세 모달 */}
      <SlideModal
        ref={placeDetailModalRef}
        onClose={() => placeDetailModalRef.current?.dismiss()}
        snapPoints={['25%']}
      >
        {selectedPlaceForModal && (
          <PlaceDetailModal
            place={selectedPlaceForModal}
            routeType={routeType}
            onSetAsStart={() => handlePlaceTypeConfirm('start')}
            onSetAsEnd={() => handlePlaceTypeConfirm('end')}
            onSetAsWaypoint={() => handlePlaceTypeConfirm('waypoint')}
            onToggleRouteType={toggleRouteType}
          />
        )}
      </SlideModal>
    </View>
  );
};

export default MapScreen;
