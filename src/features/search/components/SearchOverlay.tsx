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
import { useAutocomplete } from '../hooks/useAutocomplete';
import { useRecentSearches } from '../hooks/useRecentSearches';
import {
  IconPlace,
  IconSearch,
  IconClose,
  IconLocatorMark,
} from '@/shared/components/icons';
import { reverseGeocode } from '../services/search.api';
import { AutocompleteResult, PlaceInfo } from '../model/search.types';
import { useMyPositionStore } from '@/shared/stores/useMyPositionStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchStore } from '@/features/search/stores/useSearchStore';

interface SearchOverlayProps {
  onClose: () => void;
  onPress: () => void;
  onPlaceSelect: (place: AutocompleteResult) => void;
}

const SearchOverlay = ({
  onClose,
  onPlaceSelect,
  onPress,
}: SearchOverlayProps) => {
  const [searchText, setSearchText] = useState('');
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);

  const {
    query,
    isLoading,
    error,
    results,
    setQuery,
    clearSearch,
    hasResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAutocomplete();

  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useRecentSearches();

  const { showSearchOverlay } = useSearchStore();

  const { myPosition } = useMyPositionStore();

  // 검색어가 변경될 때 useAutocomplete에 반영
  const handleSearchTextChange = useCallback(
    (text: string) => {
      setSearchText(text);
      setQuery(text);
    },
    [setQuery],
  );

  const handleSearchResultSelect = useCallback(
    (place: PlaceInfo | AutocompleteResult) => {
      const uniqueId = 'placeKey' in place ? place.placeKey : place.id;

      const selectedPlace: AutocompleteResult = {
        placeKey: uniqueId,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        distance: place.distance || '',
        category: place.category || '',
      };
      addRecentSearch(selectedPlace);
      onPlaceSelect(selectedPlace);
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
      handleSearchResultSelect(recent);
    },
    [handleSearchResultSelect],
  );

  // 검색 결과
  const renderSearchResult = useCallback(
    ({ item }: { item: PlaceInfo }) => (
      <TouchableOpacity
        style={[
          tw('flex-row items-center px-4 py-3 border-b'),
          { borderBottomColor: '#D8D8D8' },
        ]}
        onPress={() => handleSearchResultSelect(item)}
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
    [handleSearchResultSelect],
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
          onPress={() => removeRecentSearch(item.placeKey)}
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
    setIsLoadingCurrentLocation(true);

    try {
      if (!myPosition) return;
      const place = await reverseGeocode(myPosition.lat, myPosition.lng);
      if (!place) return;

      handleSearchResultSelect(place);
    } catch (error: any) {
      console.log('현위치 검색 실패:', error.message);
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  }, [handleSearchResultSelect, myPosition]);

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={[
          tw('absolute toåçp-0 left-0 w-full flex justify-center items-center'),
          { zIndex: 10 },
        ]}
      >
        <SearchBar
          value={searchText}
          onChangeText={handleSearchTextChange}
          showBackButton={showSearchOverlay}
          showCloseButton={searchText.length > 0}
          onPress={onPress}
          onPressBack={handleBackPress}
          onPressClose={handleClearSearchPress}
          onPressSearch={onPress}
          onFocus={onPress}
        />
      </SafeAreaView>

      {showSearchOverlay && (
        <View
          style={[
            tw('bg-surface-primary absolute top-0 left-0 w-full'),
            { zIndex: 9, height: '100%' },
          ]}
        >
          {/* 검색바 헤더 */}
          <SafeAreaView
            edges={['top']}
            style={[tw('px-4 pb-2 text-on-surface-primary'), { marginTop: 56 }]}
          >
            {/* 빠른 액세스 태그 버튼 */}
            <View style={[tw('flex-row justify-end'), { gap: 2 }]}>
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
                    <View
                      style={tw('w-4 h-4 mr-1 items-center justify-center')}
                    >
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
            </View>
          </SafeAreaView>

          {/* 검색 결과 영역 */}
          <View style={tw('flex-1')}>
            {query.length === 0 ? (
              // 최근 검색 표시
              <View style={tw('flex-1')}>
                <View
                  style={[
                    tw(
                      'px-5 py-4 border-t flex-row justify-between items-center',
                    ),
                    { borderTopColor: '#D8D8D8' },
                  ]}
                >
                  <Text
                    style={tw(
                      'text-base font-primary-700 text-on-surface-primary',
                    )}
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
                  keyExtractor={item => item.placeKey}
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
                    <Text style={tw('text-on-surface-tertiary')}>
                      검색중...
                    </Text>
                  </View>
                ) : hasResults ? (
                  <FlatList
                    data={results}
                    renderItem={renderSearchResult}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                    // 스크롤이 바닥에 닿으면 다음 페이지 호출
                    onEndReached={() => {
                      if (hasNextPage) {
                        fetchNextPage();
                      }
                    }}
                    // 바닥에서 50% 정도 남았을 때 미리 호출
                    onEndReachedThreshold={0.5}
                    // 바닥에서 로딩 중일 때 스피너 보여주기
                    ListFooterComponent={
                      isFetchingNextPage ? (
                        <View style={tw('py-4')}>
                          <ActivityIndicator size="small" color="#888" />
                        </View>
                      ) : null
                    }
                  />
                ) : error ? (
                  <View style={tw('flex-1 justify-center items-center px-4')}>
                    <Text style={tw('text-red-500 text-center mb-1')}>
                      오류 발생
                    </Text>
                    <Text style={tw('text-on-surface-tertiary text-center')}>
                      {error}
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
        </View>
      )}
    </>
  );
};

export default SearchOverlay;
