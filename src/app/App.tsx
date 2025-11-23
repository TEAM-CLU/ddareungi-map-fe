import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DevHub from '@/app/routes/DevHub';
import { tw } from '@/shared/libs/tw-helper';
import RouteRecommendModal from '@/features/routing/components/recommend/RouteRecommendModal';
import RouteSelectedDetailModal from '@/features/routing/components/RouteSelectedDetailModal';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import PlaceDetailModal from '@/features/search/components/PlaceDetailModal';
import NearbyStationModal from '@/features/station/components/NearbyStationModal';
import StationDetailModal from '@/features/station/components/StationDetailModal';
import SlideModal from '@/shared/components/modal/SlideModal';
import { useModalStore } from '@/shared/stores/useModalStore';

const App = () => {
  return <DevHub />;
};

export default App;
