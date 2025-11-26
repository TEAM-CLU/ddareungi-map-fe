import React, { useCallback, useEffect, useState } from 'react';
import { View, Alert, TouchableOpacity, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RouteInputBar from '@/features/routing/components/RouteInputBar';
import {
  Route,
  RouteData,
  RoutePoint,
  RouteType,
} from '@/features/routing/model/routing.types';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';
import { useRouteStore } from '@/features/routing/stores/useRouteStore';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useAppNavigation } from '@/shared/hooks/useAppNavigation';
import { useAppRoute } from '@/shared/hooks/useAppRoute';
import RoundButton from '@/shared/components/button/RoundButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { useRouteSelect } from '@/features/routing/hooks/useRouteSelect';

const RouteSelectScreen = () => {
  const {
    routes,
    isLoadingRoutes,
    routeSearchError,
    baseTime,
    setBaseTime,
    handleRoutePointPress,
    handleAddNewWaypointAndEdit,
    handleRouteInputBarClose,
    handleRouteSearchConfirm,
    handleRouteItemPress,
  } = useRouteSelect();

  return (
    <View style={tw('flex-1 bg-surface-primary')}>
      {/* RouteInputBar */}
      <SafeAreaView edges={['top']} style={tw('bg-brand-primary w-full pb-4')}>
        <View style={tw('mx-2')}>
          <RouteInputBar
            onRoutePointPress={handleRoutePointPress}
            onAddWaypointAndEdit={handleAddNewWaypointAndEdit}
            onClose={handleRouteInputBarClose}
          />
        </View>
      </SafeAreaView>
      <View
        style={[
          tw(
            'bg-surface-primary flex flex-row w-full items-center justify-between px-4 py-1',
          ),
          { borderColor: '#D8D8D8', borderBottomWidth: 1 },
        ]}
      >
        <RouteTimeRefreshBar
          baseTime={baseTime}
          onRefresh={() => setBaseTime(new Date())}
        />
        <RoundButton
          title={'경로 검색하기'}
          onPress={handleRouteSearchConfirm}
          preset={'sm'}
        />
      </View>
      <RouteSelectContainer
        routes={routes}
        isLoading={isLoadingRoutes}
        error={routeSearchError}
        baseTime={baseTime}
        onRoutePress={handleRouteItemPress}
      />
    </View>
  );
};

export default RouteSelectScreen;
