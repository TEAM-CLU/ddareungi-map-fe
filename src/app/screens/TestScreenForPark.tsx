import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Alert } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import SearchBar from '@/features/search/components/SearchBar';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Footer from '@/shared/components/Footer';
import SearchOverlay from '@/features/search/components/SearchOverlay';
import { AutocompleteResult } from '@/features/search/hooks/useAutocomplete';
import RouteInputBar from '@/features/routing/components/RouteInputBar';
import SlideModal from '@/shared/components/modal/SlideModal';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RoutePoint, RouteType } from '@/features/routing/model/routing.types';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapScreenNavigationProp = NavigationProp<RootStackParamList>;

const TestScreenForPark = () => {
  return (
    <View style={tw('flex-1 bg-white')}>
      <View style={tw('px-4 pt-12')}>
        <RouteTimeRefreshBar />
      </View>
    </View>
  );
};

export default TestScreenForPark;
