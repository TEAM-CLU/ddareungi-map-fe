import React, { useRef } from 'react';
import { View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import SlideModal from '@/shared/components/modal/SlideModal';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import SearchBar from '@/features/search/components/SearchBar';
import MyLocationButton from '@/features/location/components/MyLocationButton';
import StationDetailModal from '@/features/station/components/StationDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import { useMapController } from '@/shared/hooks/useMapController';
import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import StationMarkersToggleBtn from '@/features/station/components/StationMarkersToggleBtn';
import { useRoutePreviewOnMap } from '@/features/routing/hooks/useRoutePreviewOnMap';
import RouteSelectedDetailModal from '@/features/routing/components/RouteSelectedDetailModal';
import { useRouteStore } from '@/features/routing/stores/routeStore';

const MapScreen = () => {
  const {
    webRef,
    navigation,

    showSearchOverlay,
    selectedPlaceInfoForModal, // 장소 상세 모달에 띄울 데이터
    selectedRouteData,        // 선택된 경로 상세 모달에 띄울 데이터

    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,
    handleOpenNearbyStationModal,
    handleOpenRouteRecommendModal,
    handleSelectedRouteDetailModalClose,
    handleStartNavigationPress,

    placeDetailModalRef,
    stationDetailModalRef,
    nearbyStationModalRef,
    routeRecommendModalRef,
    selectedRouteDetailModalRef,

    myPosition,
    setMyPosition,
    stationMetaData,
    setStationMetaData,
  } = useMapController();

  const { start, end, waypoints } = useRouteStore();

  // 경로 마커 및 폴리라인 미리보기
  useRoutePreviewOnMap(webRef);

  const lamda = useRef<number>(1.2); // 실제 도로 거리를 고려한 보정 계수

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
        <StationMarkersToggleBtn webRef={webRef} />
      </View>

      <Footer
        setIsStationButtonPressed={handleOpenNearbyStationModal}
        setIsRouteRecommendBtnPressed={handleOpenRouteRecommendModal}
      />

      {/* 경로추천 모달 */}
      <SlideModal
        ref={routeRecommendModalRef}
        snapPoints={['45%', '48%']}
        initialIndex={1}
        onClose={() => routeRecommendModalRef.current?.dismiss()}
      >
        <RouteRecommendModal
          navigation={navigation}
          routeRecommendModalRef={routeRecommendModalRef}
        />
      </SlideModal>

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
          webRef={webRef}
          lamda={lamda}
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
          navigation={navigation}
          onClose={() => stationDetailModalRef.current?.dismiss()}
          lamda={lamda}
        />
      </SlideModal>

      {/* 장소 상세 모달 */}
      <SlideModal
        ref={placeDetailModalRef}
        onClose={() => placeDetailModalRef.current?.dismiss()}
        snapPoints={['35%', '50%']}
      >
        {selectedPlaceInfoForModal && (
          <PlaceDetailModal
            place={selectedPlaceInfoForModal}
            navigation={navigation}
            onClose={() => placeDetailModalRef.current?.dismiss()}
            myPosition={myPosition}
          />
        )}
      </SlideModal>

      {/* 선택된 경로 상세 모달 */}
      <SlideModal
        ref={selectedRouteDetailModalRef}
        snapPoints={['50%']}
        onClose={handleSelectedRouteDetailModalClose}
        >
          <RouteSelectedDetailModal
          selectedRouteData={selectedRouteData}
          startAddress={start?.address || start?.name}
          endAddress={end?.address || end?.name}
          waypoints={waypoints}
          onStartNavigationPress={handleStartNavigationPress}
          onClose={handleSelectedRouteDetailModalClose}
        />
      </SlideModal>
    </View>
  );
};

export default MapScreen;
