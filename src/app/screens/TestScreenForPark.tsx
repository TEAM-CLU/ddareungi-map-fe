import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import SearchBar from '@/features/search/components/SearchBar';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Footer from '@/shared/components/Footer';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavigationProp = NavigationProp<RootStackParamList>;

const TestScreenForPark = () => {
    const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();

  // 검색 오버레이 상태
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // 검색 화면에서 선택한 장소 정보 받기
  const selectedPlace = route.params?.selectedPlace;

  useEffect(() => {
    if (selectedPlace) {
      console.log('선택된 장소:', selectedPlace);
      // 여기서 지도를 해당 장소로 이동시키는 로직 추가
    }
  }, [selectedPlace]);

  // 검색바 클릭 처리
  const handleSearchPress = () => {
    setShowSearchOverlay(true);
  };

  // 검색 오버레이 닫기
  const handleSearchClose = () => {
    setShowSearchOverlay(false);
  };

  // 장소 선택 처리
  const handlePlaceSelect = (place: AutocompleteResult) => {
    console.log('선택된 장소:', place);
    setShowSearchOverlay(false);
    // 여기서 지도를 해당 장소로 이동시키는 로직 추가
  };
  return (
    <View style={tw('flex-1')}>

      {/* 지도 영역 (임시) */}
      <View style={tw('flex-1 bg-gray-100')}>
        {/* 여기에 실제 지도 컴포넌트가 들어갈 예정 */}
        <View style={tw('flex-1 items-center justify-center')}>
          <Text style={tw('text-gray-400 text-lg')}>지도 영역</Text>
          <Text style={tw('text-gray-300 text-sm mt-2')}>
            지도 라이브러리 연동 예정
          </Text>
        </View>

        {/* 검색바 (지도 위에 오버레이) */}
        <View style={tw('absolute top-12 left-4 right-4 z-10')}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="오늘은 어디로 갈까요?"
            readOnly={true}
            onPress={handleSearchPress}
          />
        </View>
      </View>

      {/* 검색 오버레이 - 항상 마운트, 표시만 제어 */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        onClose={handleSearchClose}
        onPlaceSelect={handlePlaceSelect}
        placeholder="오늘은 어디로 갈까요?"
      />

      <Footer />
    </View>
  );
};

export default TestScreenForPark;
