import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
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
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/app/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRouteStore } from '@/features/routing/stores/routeStore';
import StationMarkersToggleBtn from '@/features/station/components/StationMarkersToggleBtn';

const MapScreen = () => {
  const {
    webRef,
    showSearchOverlay,
    selectedPlaceForModal,
    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,
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
  const [isRouteRecommendBtnPressed, setIsRouteRecommendBtnPressed] =
    useState(false);
  const routeRecommendModalRef = useRef<BottomSheetModal | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { distance, setDistance } = useRouteStore();

  // RouteRecommendModal 오픈 처리
  useEffect(() => {
    if (isRouteRecommendBtnPressed) {
      console.log('[MapScreen] 추천경로 탭 클릭, distance:', distance);

      // distance가 null이면 기본값 5로 설정
      if (distance === null) {
        console.log('[MapScreen] distance가 null이므로 5로 초기화');
        setDistance(5);
      }

      routeRecommendModalRef.current?.present();
      setIsRouteRecommendBtnPressed(false);
    }
  }, [isRouteRecommendBtnPressed, distance, setDistance]);

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
        currentLocation={myPosition}
      />

      <View style={[tw('absolute right-3'), { bottom: 150 }]}>
        <MyLocationButton webRef={webRef} />
      </View>

      <View style={[tw('absolute right-3'), { bottom: 100 }]}>
        <StationMarkersToggleBtn webRef={webRef} />
      </View>

      <Footer
        setIsStationButtonPressed={setIsStationButtonPressed}
        setIsRouteRecommendBtnPressed={setIsRouteRecommendBtnPressed}
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
          setIsRouteRecommendBtnPressed={setIsRouteRecommendBtnPressed}
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
        />
      </SlideModal>
      {/* 장소 상세 모달 */}
      <SlideModal
        ref={placeDetailModalRef}
        onClose={() => placeDetailModalRef.current?.dismiss()}
        snapPoints={['35%', '50%']}
      >
        {selectedPlaceForModal && (
          <PlaceDetailModal
            place={selectedPlaceForModal}
            navigation={navigation}
            onClose={() => placeDetailModalRef.current?.dismiss()}
          />
        )}
      </SlideModal>
    </View>
  );
};

export default MapScreen;
