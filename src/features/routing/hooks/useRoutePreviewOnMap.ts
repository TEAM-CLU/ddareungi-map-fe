import { useEffect, useMemo } from 'react';
import WebView from 'react-native-webview';
import { useMapRouting } from './useMapRouting';
import { useRouteStore } from '../stores/routeStore';
import { RouteType } from '../model/routing.types';

interface RoutePreviewPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

interface RoutePreviewPathPoint {
  lat: number;
  lng: number;
}

export const useRoutePreviewOnMap = (
  webRef: React.RefObject<WebView | null>,
) => {
  const { routeType, start, end, waypoints, routes } = useRouteStore();
  const { updateRoute, clearRoute } = useMapRouting(webRef);

  const geometryPath = useMemo<RoutePreviewPathPoint[] | null>(() => {
    if (!routes?.data || routes.data.length === 0) {
      return null;
    }

    const primaryRoute = routes.data[0];
    return primaryRoute.segments.flatMap(segment =>
      segment.geometry?.points?.map(([lng, lat]) => ({ lat, lng })) ?? [],
    );
  }, [routes]);

  useEffect(() => {
    const points: RoutePreviewPoint[] = [];

    if (start?.latitude && start?.longitude) {
      points.push({
        id: 'start',
        lat: start.latitude,
        lng: start.longitude,
        name: start.name,
      });
    }

    waypoints.forEach(wp => {
      if (wp.place?.latitude && wp.place?.longitude) {
        points.push({
          id: wp.waypointKey,
          lat: wp.place.latitude,
          lng: wp.place.longitude,
          name: wp.place.name,
        });
      }
    });

    if (end?.latitude && end?.longitude) {
      points.push({
        id: 'end',
        lat: end.latitude,
        lng: end.longitude,
        name: end.name,
      });
    }

    if (points.length === 0) {
      clearRoute();
      return;
    }

    const fallbackPath = points.map(point => ({ lat: point.lat, lng: point.lng }));
    const pathPayload = geometryPath && geometryPath.length > 0 ? geometryPath : fallbackPath;

    updateRoute(
      routeType === RouteType.LOOP ? 'LOOP' : 'CONSTANT',
      points,
      pathPayload,
    );
  }, [
    routeType,
    start,
    end,
    waypoints,
    geometryPath,
    updateRoute,
    clearRoute,
  ]);
};
