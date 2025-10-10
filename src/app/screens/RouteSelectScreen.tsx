import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RouteInputBar from '@/features/routing/components/RouteInputBar';
import { RoutePoint, RouteType } from '@/features/routing/model/routing.types';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import {
  RouteProp,
  useRoute,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import { RootStackParamList } from '../types';

type RouteSelectScreenRouteProp = RouteProp<RootStackParamList, 'RouteSelect'>;
type RouteSelectScreenNavigationProp = NavigationProp<RootStackParamList>;

const RouteSelectScreen = () => {
  const route = useRoute<RouteSelectScreenRouteProp>();
  const navigation = useNavigation<RouteSelectScreenNavigationProp>();

  const [routeType, setRouteType] = useState<RouteType>(RouteType.CONSTANT);
  const [currentSelectedPoint, setCurrentSelectedPoint] =
    useState<RoutePoint | null>(null);

  const [routeData, setRouteData] = useState<{
    [key: string]: AutocompleteResult;
  }>({});

  // route params에서 전달받은 장소 정보 처리
  React.useEffect(() => {
    if (route.params?.selectedPlace && route.params?.placeType) {
      const { selectedPlace, placeType } = route.params;

      if (placeType === 'start') {
        if (routeType === RouteType.LOOP) {
          // Loop 모드: 원점 - 출발지=도착지로 동일하게 설정
          setRouteData(prev => ({
            ...prev,
            start: selectedPlace,
            end: selectedPlace,
          }));
        } else {
          // Constant 모드: 출발지만 설정
          setRouteData(prev => ({
            ...prev,
            start: selectedPlace,
          }));
        }
      } else if (placeType === 'end') {
        setRouteData(prev => ({
          ...prev,
          end: selectedPlace,
        }));
      } else if (placeType === 'waypoint') {
        // 경유지로 설정 - waypoint-1부터 순차적으로 설정
        setRouteData(prev => {
          // 빈 경유지 슬롯 찾기
          let waypointKey = 'waypoint-1';
          let index = 1;
          while (prev[waypointKey] && index < 10) {
            index++;
            waypointKey = `waypoint-${index}`;
          }

          return {
            ...prev,
            [waypointKey]: selectedPlace,
          };
        });
      }
    }
  }, [route.params, routeType]);

  // RouteInputBar에서 빈 칸 선택 시 검색 화면으로 이동
  const handleRoutePointPress = (point: RoutePoint) => {
    setCurrentSelectedPoint(point);
    // MapScreen으로 이동하면서 검색 오버레이 자동 열기
    navigation.navigate('Map', {
      openSearchOverlay: true,
      placeType: point.type,
    });
  };

  // RouteInputBar 데이터 초기화 처리
  const handleRouteDataReset = () => {
    setRouteData({});
    setCurrentSelectedPoint(null);
  };

  return (
    <View style={tw('flex-1 bg-white')}>
      {/* 상단 RouteInputBar 영역 */}
      <View style={tw('bg-brand-primary w-full pt-16 pb-4')}>
        <View style={tw('mx-2')}>
          <RouteInputBar
            routeType={routeType}
            onRoutePointPress={handleRoutePointPress}
            onClose={() => navigation.goBack()}
            routeData={routeData}
          />
        </View>
      </View>

      {/* 나머지 컨텐츠 영역 */}
      <View style={tw('flex-1 p-4')}>
        <Text style={tw('text-gray-600 text-base')}>경로 옵션</Text>
      </View>
    </View>
  );
};

export default RouteSelectScreen;
