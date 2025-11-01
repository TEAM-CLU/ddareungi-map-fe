import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import SearchBar from './SearchBar';
import { useAutocomplete, AutocompleteResult } from '../hooks/useAutocomplete';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { SEARCH_CONSTANTS } from '../model/search.constants';
import {
  IconPlace,
  IconSearch,
  IconClose,
  IconLocatorMark,
} from '@/shared/components/icons';
import { reverseGeocode } from '../services/search.api';
import { Coordinates } from '@/features/map/model/map.types';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '@/features/map/utils/location';

interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onPlaceSelect: (place: AutocompleteResult) => void;
  placeholder?: string;
  currentLocation?: Coordinates; // 현재 위치 추가
}

const SearchOverlay = ({
  isVisible,
  onClose,
  onPlaceSelect,
  placeholder = '오늘은 어디로 갈까요?',
  currentLocation,
}: SearchOverlayProps) => {
  const [searchText, setSearchText] = useState('');
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    query,
    isLoading,
    error,
    results,
    setQuery,
    clearSearch,
    hasResults,
  } = useAutocomplete();

  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useRecentSearches();

  // 오버레이 표시/숨김 애니메이션
  useEffect(() => {
    if (isVisible) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: SEARCH_CONSTANTS.ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: SEARCH_CONSTANTS.ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim]);

  // 검색어가 변경될 때 useAutocomplete에 반영
  const handleSearchTextChange = useCallback(
    (text: string) => {
      setSearchText(text);
      setQuery(text);
    },
    [setQuery],
  );

  const handlePlaceSelect = useCallback(
    (place: AutocompleteResult) => {
      addRecentSearch(place);
      onPlaceSelect(place);
      setSearchText('');
      clearSearch();
      onClose();
    },
    [onPlaceSelect, onClose, clearSearch, addRecentSearch],
  );

  const handleBackPress = useCallback(() => {
    setSearchText('');
    clearSearch();
    onClose();
  }, [clearSearch, onClose]);

  const handleClearSearchPress = useCallback(() => {
    setSearchText('');
    clearSearch();
  }, [clearSearch]);

  const handleRecentSelect = useCallback(
    (recent: AutocompleteResult) => {
      const autocompleteResult: AutocompleteResult = {
        id: recent.id,
        name: recent.name,
        address: recent.address,
        latitude: recent.latitude,
        longitude: recent.longitude,
        distance: recent.distance || '',
        category: recent.category || '',
      };
      handlePlaceSelect(autocompleteResult);
    },
    [handlePlaceSelect],
  );

  // 검색 결과
  const renderSearchResult = useCallback(
    ({ item }: { item: AutocompleteResult }) => (
      <TouchableOpacity
        style={[
          tw('flex-row items-center px-4 py-3 border-b'),
          { borderBottomColor: '#D8D8D8' },
        ]}
        onPress={() => handlePlaceSelect(item)}
      >
        <View style={tw('mr-3 items-center')}>
          <IconPlace width={15} height={18} />
          {item.distance && (
            <Text
              style={tw(
                'font-primary-600 text-xs text-on-surface-quaternary mt-1',
              )}
            >
              {item.distance}
            </Text>
          )}
        </View>

        <View style={tw('flex-1')}>
          <View style={tw('flex-row items-center mb-1')}>
            <Text
              style={tw('font-primary-600 text-base text-on-surface-primary')}
            >
              {item.name}
            </Text>
            {item.category && (
              <Text
                style={tw(
                  'font-primary-600 text-xs text-on-surface-quaternary ml-2',
                )}
              >
                {item.category}
              </Text>
            )}
          </View>
          <Text style={tw('font-primary-600 text-xs text-on-surface-tertiary')}>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handlePlaceSelect],
  );

  // 최근 검색 결과
  const renderRecentResult = useCallback(
    ({ item }: { item: AutocompleteResult }) => (
      <TouchableOpacity
        style={[
          tw('flex-row items-center px-4 py-3 border-b'),
          { borderBottomColor: '#D8D8D8' },
        ]}
        onPress={() => handleRecentSelect(item)}
      >
        <View
          style={tw(
            'w-8 h-8 bg-icon-container-primary rounded-full items-center justify-center mr-3',
          )}
        >
          <IconSearch width={15} height={15} color="#FFF" />
        </View>
        <View style={tw('flex-1')}>
          <Text
            style={tw(
              'font-primary-600 text-base text-on-surface-primary mb-1',
            )}
          >
            {item.name}
          </Text>
          <Text style={tw('font-primary-600 text-xs text-on-surface-tertiary')}>
            {item.address}
          </Text>
        </View>
        <TouchableOpacity
          style={tw('p-2')}
          onPress={() => removeRecentSearch(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconClose width={12} height={12} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleRecentSelect, removeRecentSearch],
  );

  // 현위치 버튼 핸들러
  const handleCurrentLocationPress = useCallback(async () => {
    console.log('[SearchOverlay] 현위치 버튼 클릭');
    setIsLoadingCurrentLocation(true);

    try {
      // currentLocation이 있으면 사용, 없으면 Geolocation으로 가져오기
      if (currentLocation) {
        console.log('[SearchOverlay] currentLocation 사용:', currentLocation);
        const place = await reverseGeocode(
          currentLocation.lat,
          currentLocation.lon,
        );

        console.log('[SearchOverlay] 역지오코딩 결과:', place);

        if (place) {
          const autocompleteResult: AutocompleteResult = {
            id: place.id,
            name: place.name,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            distance: '',
            category: place.category || '',
          };
          handlePlaceSelect(autocompleteResult);
        } else {
          Alert.alert(
            '주소 변환 실패',
            '현재 위치의 주소를 가져올 수 없습니다.',
          );
        }
      } else {
        console.log('[SearchOverlay] Geolocation으로 위치 가져오기 시작');
        // currentLocation이 없으면 직접 위치 가져오기
        const hasPermission = await requestLocationPermission();
        console.log('[SearchOverlay] 위치 권한:', hasPermission);

        if (!hasPermission) {
          Alert.alert('권한 필요', '위치 권한이 필요합니다.');
          setIsLoadingCurrentLocation(false);
          return;
        }

        Geolocation.getCurrentPosition(
          async position => {
            console.log('[SearchOverlay] 위치 가져오기 성공:', position.coords);
            const { latitude, longitude } = position.coords;

            try {
              const place = await reverseGeocode(latitude, longitude);
              console.log('[SearchOverlay] 역지오코딩 결과:', place);

              if (place) {
                const autocompleteResult: AutocompleteResult = {
                  id: place.id,
                  name: place.name,
                  address: place.address,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  distance: '',
                  category: place.category || '',
                };
                handlePlaceSelect(autocompleteResult);
              } else {
                Alert.alert(
                  '주소 변환 실패',
                  '현재 위치의 주소를 가져올 수 없습니다.',
                );
              }
            } catch (geocodeError) {
              console.error('[SearchOverlay] 역지오코딩 오류:', geocodeError);
            } finally {
              setIsLoadingCurrentLocation(false);
            }
          },
          error => {
            console.error('[SearchOverlay] 위치 가져오기 오류:', error);
            Alert.alert(
              '오류',
              `현재 위치를 가져올 수 없습니다. (${error.message})`,
            );
            setIsLoadingCurrentLocation(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
        );
        return; // Geolocation 콜백에서 setIsLoadingCurrentLocation 처리
      }
    } catch (error) {
      console.error('[SearchOverlay] 현위치 주소 변환 오류:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert(
        '오류',
        `현재 위치의 주소를 가져오는 중 오류가 발생했습니다.\n상세: ${errorMessage}`,
      );
    } finally {
      if (currentLocation) {
        // currentLocation 경로에서만 여기서 처리
        setIsLoadingCurrentLocation(false);
      }
    }
  }, [currentLocation, handlePlaceSelect]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          opacity: fadeAnim,
        },
      ]}
    >
      {/* 검색바 헤더 */}
      <View style={tw('px-4 pt-12 pb-2 text-on-surface-primary')}>
        <SearchBar
          value={searchText}
          onChangeText={handleSearchTextChange}
          placeholder={placeholder}
          showBackButton={true}
          showCloseButton={searchText.length > 0}
          onPressBack={handleBackPress}
          onPressClose={handleClearSearchPress}
          autoFocus={true}
        />

        {/* 빠른 액세스 태그 버튼 */}
        <View style={[tw('flex-row mt-3'), { gap: 2 }]}>
          <TouchableOpacity
            style={tw(
              'bg-brand-primary rounded-full px-3 py-2 flex-row items-center',
            )}
            onPress={handleCurrentLocationPress}
            disabled={isLoadingCurrentLocation}
          >
            {isLoadingCurrentLocation ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <View style={tw('w-4 h-4 mr-1 items-center justify-center')}>
                  <IconLocatorMark width={25} height={25} />
                </View>
                <Text
                  style={tw(
                    'text-on-surface-secondary font-primary-700 text-xs',
                  )}
                >
                  현위치
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={tw(
              'bg-icon-container-primary rounded-full px-4 py-2 flex-row items-center',
            )}
            onPress={() => {
              // 즐겨찾기 기능 구현 예정
              console.log('즐겨찾기 선택');
            }}
          >
            <View style={tw('w-4 h-4 mr-1 items-center justify-center')}>
              <Text style={tw('text-white text-xs')}>⭐</Text>
            </View>
            <Text
              style={tw('text-on-surface-secondary font-primary-700 text-xs')}
            >
              즐겨찾기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색 결과 영역 */}
      <View style={tw('flex-1')}>
        {query.length === 0 ? (
          // 최근 검색 표시
          <View style={tw('flex-1')}>
            <View
              style={[
                tw('px-5 py-4 border-t flex-row justify-between items-center'),
                { borderTopColor: '#D8D8D8' },
              ]}
            >
              <Text
                style={tw('text-base font-primary-700 text-on-surface-primary')}
              >
                최근 검색
              </Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text
                    style={tw(
                      'font-primary-600text-sm text-on-surface-tertiary',
                    )}
                  >
                    전체삭제
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {/* 최근 검색어 목록 */}
            <FlatList
              data={recentSearches}
              renderItem={renderRecentResult}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => Keyboard.dismiss()}
              ListEmptyComponent={
                <View style={tw('flex-1 justify-center items-center py-8')}>
                  <Text style={tw('text-on-surface-tertiary text-center')}>
                    최근 검색 기록이 없습니다
                  </Text>
                </View>
              }
            />
          </View>
        ) : (
          // 검색 결과 표시
          <View style={tw('flex-1 mb-8')}>
            {isLoading ? (
              <View style={tw('flex-1 justify-center items-center')}>
                <Text style={tw('text-on-surface-tertiary')}>검색중...</Text>
              </View>
            ) : hasResults ? (
              <FlatList
                data={results}
                renderItem={renderSearchResult}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={() => Keyboard.dismiss()}
              />
            ) : error ? (
              <View style={tw('flex-1 justify-center items-center')}>
                <Text style={tw('text-on-surface-tertiary')}>
                  검색 중 오류가 발생했습니다.
                </Text>
              </View>
            ) : (
              <View style={tw('flex-1 justify-center items-center')}>
                <Text style={tw('text-on-surface-tertiary')}>
                  검색 결과가 없습니다.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default SearchOverlay;
