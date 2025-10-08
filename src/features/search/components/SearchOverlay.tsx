import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Keyboard,
} from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import SearchBar from './SearchBar';
import { useAutocomplete, AutocompleteResult } from '../hooks/useAutocomplete';
import { SEARCH_CONSTANTS } from '../model/search.constants';
import {
  IconPlace,
  IconSearch,
} from '@/shared/components/icons';

interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onPlaceSelect: (place: AutocompleteResult) => void;
  placeholder?: string;
}

const SearchOverlay = ({
  isVisible,
  onClose,
  onPlaceSelect,
  placeholder = '오늘은 어디로 갈까요?',
}: SearchOverlayProps) => {
  const [searchText, setSearchText] = useState('');
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

  // 임시 최근 검색 데이터
  const recentSearches = [
    { id: '1', name: '서울과학기술대학교', address: '서울 노원구 공릉로 232' },
    { id: '2', name: '서울과학기술대학교', address: '서울 노원구 공릉로 232' },
    {
      id: '3',
      name: '서울과학기술대학교 어학원',
      address: '서울 노원구 공릉로 232',
    },
  ];

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
      onPlaceSelect(place);
      setSearchText('');
      clearSearch();
      onClose();
    },
    [onPlaceSelect, onClose, clearSearch],
  );

  const handleBack = useCallback(() => {
    setSearchText('');
    clearSearch();
    onClose();
  }, [clearSearch, onClose]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    clearSearch();
  }, [clearSearch]);

  const handleRecentSelect = useCallback(
    (recent: any) => {
      const autocompleteResult: AutocompleteResult = {
        id: recent.id,
        name: recent.name,
        address: recent.address,
        latitude: undefined,
        longitude: undefined,
        distance: '',
        category: '',
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
    ({ item }: { item: any }) => (
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
      </TouchableOpacity>
    ),
    [handleRecentSelect],
  );

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
      <View style={tw('px-4 pt-12 pb-2')}>
        <SearchBar
          value={searchText}
          onChangeText={handleSearchTextChange}
          placeholder={placeholder}
          showBackButton={true}
          showCloseButton={searchText.length > 0}
          onPressBack={handleBack}
          onPressClose={handleClearSearch}
          autoFocus={true}
        />
      </View>

      {/* 검색 결과 영역 */}
      <View style={tw('flex-1')}>
        {query.length === 0 ? (
          // 최근 검색 표시
          <View style={tw('flex-1')}>
            <View
              style={[tw('px-5 py-4 border-t'), { borderTopColor: '#D8D8D8' }]}
            >
              <Text
                style={tw('text-base font-primary-700 text-on-surface-primary')}
              >
                최근 검색
              </Text>
            </View>
            {/* 최근 검색어 목록 */}
            <FlatList
              data={recentSearches}
              renderItem={renderRecentResult}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => Keyboard.dismiss()}
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
