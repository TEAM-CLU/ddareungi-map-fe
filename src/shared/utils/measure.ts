import {
  MEAN_ACITIVITY_MET,
  MEAN_ADULT_PHYSICAL_INFORMATION,
  MEAN_CARBON_EMISSION,
} from '@/shared/model/index.constants';
import { TransportationType, Gender } from '@/shared/model/index.types';

export const measureCaloriesBurned = (
  transportationType: TransportationType, // 'walking' | 'cycling' | 'idle'
  gender: Gender,
  deltaSeconds: number,
): number => {
  if (deltaSeconds <= 0) return 0;

  const { MEAN_WALKING_MET, MEAN_CYCLING_MET } = MEAN_ACITIVITY_MET;
  const {
    MEAN_ADULT_MAN_WEIGHT_KG,
    MEAN_ADULT_WOMAN_WEIGHT_KG,
    MEAN_ADULT_NEUTRAL_WEIGHT_KG,
  } = MEAN_ADULT_PHYSICAL_INFORMATION;
  const weight =
    gender === 'M'
      ? MEAN_ADULT_MAN_WEIGHT_KG
      : gender === 'F'
      ? MEAN_ADULT_WOMAN_WEIGHT_KG
      : MEAN_ADULT_NEUTRAL_WEIGHT_KG;

  const met =
    transportationType === 'walking'
      ? MEAN_WALKING_MET
      : transportationType === 'biking'
      ? MEAN_CYCLING_MET
      : 0;

  const hours = deltaSeconds / 3600;
  return met * weight * hours;
};
export const measureCarbonSaved = (
  transportationType: TransportationType,
  distanceMeter: number,
): number => {
  const {
    EMISSION_CAR_PER_KM,
    EMISSION_WALKING_PER_KM,
    EMISSION_CYCLING_PER_KM,
  } = MEAN_CARBON_EMISSION;
  const distanceKm = distanceMeter / 1000;
  const carEmissionKM = distanceKm * EMISSION_CAR_PER_KM;

  const userEmission =
    transportationType === 'walking'
      ? distanceKm * EMISSION_WALKING_PER_KM
      : distanceKm * EMISSION_CYCLING_PER_KM;

  return carEmissionKM - userEmission;
};

export const convertToTrees = (carbonSavedKg: number) => {
  return Number((carbonSavedKg / 22).toFixed(2));
};
