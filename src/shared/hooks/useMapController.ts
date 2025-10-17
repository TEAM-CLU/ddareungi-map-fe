import { RootStackParamList } from '@/app/types';
import { Coordinates } from '@/features/map/model/map.types';
import { RouteType } from '@/features/routing/model/routing.types';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { useMapSearch } from '@/features/search/hooks/useMapSearch';
import { MapAreaStationsData } from '@/features/station/model/station.types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useRef, useState, useEffect, useCallback } from 'react';
import WebView from 'react-native-webview';

/**
 * MapScreen 상태 및 이벤트를 통합 관리하는 훅
 */
export const useMapController = () => {
  const webRef = useRef<WebView | null>(null);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();

  const { showPlaceMarker } = useMapSearch(webRef);

  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [currentPlaceType, setCurrentPlaceType] = useState<
    'start' | 'end' | 'waypoint'
  >('start');
  const [selectedPlaceForModal, setSelectedPlaceForModal] =
    useState<AutocompleteResult | null>(null);
  const [routeType, setRouteType] = useState<RouteType>(RouteType.CONSTANT);
  const [currentLocation, setCurrentLocation] = useState<{
    coordinates: Coordinates | null;
  }>({ coordinates: null });

  const placeDetailModalRef = useRef<BottomSheetModal | null>(null);

  useEffect(() => {
    if (route.params?.openSearchOverlay) setShowSearchOverlay(true);
    if (route.params?.placeType) setCurrentPlaceType(route.params.placeType);
  }, [route.params]);

  const handleSearchbarPress = useCallback(() => {
    setShowSearchOverlay(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setShowSearchOverlay(false);
    if (route.params?.openSearchOverlay) navigation.goBack();
  }, [route.params, navigation]);

  const handlePlaceSelect = useCallback(
    (place: AutocompleteResult) => {
      // RouteSelect에서 온 경우
      if (route.params?.openSearchOverlay) {
        setShowSearchOverlay(false);
        navigation.navigate('RouteSelect', {
          selectedPlace: place,
          placeType: currentPlaceType,
        });
        return;
      }

      // 일반 검색의 경우
      if (place.latitude && place.longitude) {
        showPlaceMarker(place.latitude, place.longitude, place.name, place);
      }

      setShowSearchOverlay(false);
      setSelectedPlaceForModal(place);
      placeDetailModalRef.current?.present();
    },
    [route.params, navigation, currentPlaceType, showPlaceMarker],
  );

  const [searchText, setSearchText] = useState('');

  // 출발지/도착지/경유지 설정
  const handlePlaceTypeConfirm = useCallback(
    (type: 'start' | 'end' | 'waypoint') => {
      if (!selectedPlaceForModal) return;
      placeDetailModalRef.current?.dismiss();
      navigation.navigate('RouteSelect', {
        selectedPlace: selectedPlaceForModal,
        placeType: type,
        routeType,
      });
    },
    [selectedPlaceForModal, routeType, navigation],
  );

  const toggleRouteType = useCallback(() => {
    setRouteType(prev =>
      prev === RouteType.CONSTANT ? RouteType.LOOP : RouteType.CONSTANT,
    );
  }, []);

  // station 및 관련 모달
  const [stationMetaData, setStationMetaData] =
    useState<MapAreaStationsData | null>(null);
  const [myPosition, setMyPosition] = useState<Coordinates | undefined>(
    undefined,
  );

  const nearbyStationModalRef = useRef<BottomSheetModal | null>(null);
  const stationDetailModalRef = useRef<BottomSheetModal | null>(null);

  return {
    webRef,
    placeDetailModalRef,

    showSearchOverlay,
    routeType,
    selectedPlaceForModal,

    setShowSearchOverlay,
    setSelectedPlaceForModal,
    searchText,
    setSearchText,

    handleSearchbarPress,
    handleSearchClose,
    handlePlaceSelect,
    handlePlaceTypeConfirm,
    toggleRouteType,

    // station 및 관련 모달
    nearbyStationModalRef,
    stationDetailModalRef,
    stationMetaData,
    setStationMetaData,
    myPosition,
    setMyPosition,
    currentLocation,
    setCurrentLocation,
  };
};
