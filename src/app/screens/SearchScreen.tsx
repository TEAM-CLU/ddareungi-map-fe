import React from 'react';
import { Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';

const SearchScreen = () => {
  return (
    <View style={tw('flex-1 items-center justify-center')}>
      <Text style={tw('text-yellow-400 text-2xl font-bold')}>Search</Text>
    </View>
  );
};

export default SearchScreen;
