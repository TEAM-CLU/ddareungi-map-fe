import React from 'react';
import { View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import RouteRecommendInputBar from '@/features/routing/components/recommend/RouteRecommendInputBar';
import RouteTimeRefreshBar from '@/features/routing/components/RouteTimeRefreshBar';
import RouteSelectContainer from '@/features/routing/components/RouteSelectContainer';
import RoundButton from '@/shared/components/button/RoundButton';
import { useRouteRecommend } from '@/features/routing/hooks/useRouteRecommend';
import { useBlockBackNavigation } from '@/shared/hooks/useBlockBackNavigation';

const RouteRecommendScreen = () => {
  const {
    handleRoutePointPress,
    handleDistancePress,
    handleRouteInputBarClose,
    handleRouteSearchConfirm,
    handleRouteItemPress,
    baseTime,
    setBaseTime,
    routes,
    isLoadingRoutes,
    routeSearchError,
  } = useRouteRecommend();

  useBlockBackNavigation(true);

  return (
    <View style={tw('flex-1 bg-surface-primary')}>
      <View style={tw('bg-brand-primary w-full pt-16 pb-4')}>
        <View style={tw('mx-2')}>
          <RouteRecommendInputBar
            onRoutePointPress={handleRoutePointPress}
            onDistancePress={handleDistancePress}
            onClose={handleRouteInputBarClose}
          />
        </View>
      </View>

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

export default RouteRecommendScreen;
