import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import WebView from 'react-native-webview';
import Footer from '@/shared/components/Footer';
import Map from '@/features/map/components/Map';
import MyLocationButton from '@/features/map/components/MyLocationButton';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { RouteType } from '@/features/routing/model/routing.types';
import SearchBar from '@/features/search/components/SearchBar';
import {
  useNavigation,
  NavigationProp,
  RouteProp,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../types/index';
import { useMapWebview } from '@/features/map/hooks/useMapWebview';

type MapScreenNavigationProp = NavigationProp<RootStackParamList>;
type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const MapScreen = () => {
  const webRef = useRef<WebView | null>(null);
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();
  const placeDetailModalRef = useRef<BottomSheetModal>(null);

  // 맵 준비 상태
  const [isMapReady, setIsMapReady] = useState(false);
  const { showPlaceMarker } = useMapWebview(webRef, isMapReady);

  // 검색 관련 상태
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // RouteSelect에서 온 경우의 placeType 저장
  const [currentPlaceType, setCurrentPlaceType] = useState<
    'start' | 'end' | 'waypoint'
  >('start');

  // route params 처리
  React.useEffect(() => {
    if (route.params?.openSearchOverlay) {
      setShowSearchOverlay(true);
      if (route.params.placeType) {
        setCurrentPlaceType(route.params.placeType);
      }
    }
  }, [route.params]);

  // 선택된 장소 상태 (모달에서 표시할 장소)
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    useState<AutocompleteResult | null>(null);

  // 경로 타입 상태 (PlaceDetailModal에서 필요)
  const [routeType, setRouteType] = useState<RouteType>(RouteType.CONSTANT);

  // 검색바 클릭 처리 - SearchOverlay 표시
  const handleSearchbarPress = () => {
    setShowSearchOverlay(true);
  };

  // 검색 오버레이 닫기
  const handleSearchClose = () => {
    setShowSearchOverlay(false);
    // RouteSelect에서 온 경우 다시 RouteSelect로 돌아가기
    if (route.params?.openSearchOverlay) {
      navigation.goBack();
    }
  };

  // 장소 선택 처리 (검색 결과에서)
  const handlePlaceSelect = (place: AutocompleteResult) => {
    // RouteSelect에서 온 경우: RouteSelect로 돌아가면서 선택된 장소 전달
    if (route.params?.openSearchOverlay) {
      setShowSearchOverlay(false);
      navigation.navigate('RouteSelect', {
        selectedPlace: place,
        placeType: currentPlaceType,
      });
      return;
    }

    // 일반 검색의 경우: 기존 로직대로 맵에 마커 표시 + 모달
    if (place.latitude && place.longitude) {
      showPlaceMarker(place.latitude, place.longitude, place.name, place);
    }

    setShowSearchOverlay(false);
    setSelectedPlaceForModal(place);
    placeDetailModalRef.current?.present();
  };

  return (
    <View style={tw('flex-1 relative w-full')}>
      <Map webRef={webRef} />

      {/* 검색바 */}
      {!showSearchOverlay && (
        <View style={tw('absolute top-12 left-4 right-4 z-10')}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="오늘은 어디로 갈까요?"
            readOnly={true}
            onPress={handleSearchbarPress}
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

      <View style={tw('absolute bottom-40 right-3')}>
        <MyLocationButton webRef={webRef} />
      </View>

      <Footer />

    </View>
  );
};

export default MapScreen;
