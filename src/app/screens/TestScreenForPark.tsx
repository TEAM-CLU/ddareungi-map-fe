import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import SearchBar from '@/features/search/components/SearchBar';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';

const TestScreenForPark = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (searchText.trim()) {
      Alert.alert('검색', `"${searchText}" 검색 실행`);
    }
  };

  return (
    <View style={tw('flex-1 bg-surface-primary p-4')}>
      <View style={tw('mt-12')}>
        <Text style={tw('text-lg font-primary-700 mb-4')}>
          🔍 SearchBar 예시들
        </Text>

        {/* Map 화면용 - readOnly, 클릭 시 검색 화면으로 이동 */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-sm font-primary-600 mb-2 text-gray-600')}>
            Map 화면 (ReadOnly)
          </Text>
          <SearchBar
            value=""
            onChangeText={() => {}}
            readOnly
            onPressSearch={() => navigation.navigate('Search')}
          />
        </View>

        {/* 검색 화면용 - 뒤로가기 + 입력 가능 */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-sm font-primary-600 mb-2 text-gray-600')}>
            Search 화면 (입력 가능)
          </Text>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            showBackButton
            showCloseButton
            onPressBack={() => navigation.goBack()}
            onPressClose={() => setSearchText('')}
            onSubmit={handleSearch}
            onPressSearch={handleSearch}
          />
        </View>
      </View>
    </View>
  );
};

export default TestScreenForPark;
