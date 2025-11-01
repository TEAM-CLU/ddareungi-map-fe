import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Alert } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RoutePoint, RouteType } from '@/features/routing/model/routing.types';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavigationProp = NavigationProp<RootStackParamList>;

const TestScreenForPark = () => {
  const [baseTime, setBaseTime] = useState<Date>(new Date());

  return (
    <View style={tw('flex-1 bg-white')}>
      <View style={tw('px-4 pt-12')}>
        <RouteTimeRefreshBar
          baseTime={baseTime}
          onRefresh={() => setBaseTime(new Date())}
        />
      </View>
    </View>
  );
};

export default TestScreenForPark;
