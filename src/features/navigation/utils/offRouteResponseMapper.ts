import {
  ApplyNavigationDataInput,
  ReRouteResponse,
  ReturnToExistingRouteResponse,
} from '@/features/navigation/model/navigation.types';

type OffRouteNavigationData =
  | ReRouteResponse['data']
  | ReturnToExistingRouteResponse['data'];

export const mapOffRouteResponseToApplyInput = (
  data: OffRouteNavigationData,
): ApplyNavigationDataInput => ({
  coordinates: data.coordinates,
  instructions: data.instructions,
  startStation: data.startStation
    ? {
        lat: data.startStation.location.lat,
        lng: data.startStation.location.lng,
        stationId: data.startStation.stationId,
        stationName: data.startStation.stationName,
      }
    : undefined,
  endStation: data.endStation
    ? {
        lat: data.endStation.location.lat,
        lng: data.endStation.location.lng,
        stationId: data.endStation.stationId,
        stationName: data.endStation.stationName,
      }
    : undefined,
  waypoints: data.waypoints
    ? data.waypoints.map(wp => [wp.lng, wp.lat] as [number, number])
    : undefined,
});

