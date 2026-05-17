export type LocationMode = 'default' | 'following' | 'compass';
export interface DataSetForUpdateMyLocation {
  lat: number;
  lng: number;
  accuracy: number;
}
