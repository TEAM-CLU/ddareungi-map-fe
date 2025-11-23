import {
  MEAN_WALKING_MET,
  MEAN_ADULT_MAN_WEIGHT_KG,
  MEAN_ADULT_WOMAN_WEIGHT_KG,
  MEAN_CYCLING_MET,
  EMISSION_CAR_PER_KM,
  EMISSION_WALKING_PER_KM,
  EMISSION_CYCLING_PER_KM,
  MEAN_ADULT_NEUTRAL_WEIGHT_KG,
} from '@/shared/model/index.constants';
import { TransportationType, Gender } from '@/shared/model/index.types';

export const measureCaloriesBurned = (
  transportationType: TransportationType,
  gender: Gender,
  mins: number,
): number => {
  const hours = mins / 60;

  const weight =
    gender === 'M'
      ? MEAN_ADULT_MAN_WEIGHT_KG
      : gender === 'F'
      ? MEAN_ADULT_WOMAN_WEIGHT_KG
      : MEAN_ADULT_NEUTRAL_WEIGHT_KG;

  const met =
    transportationType === 'walking' ? MEAN_WALKING_MET : MEAN_CYCLING_MET;

  return Math.round(met * weight * hours);
};
export const measureCarbonSaved = (
  transportationType: TransportationType,
  distanceMeter: number,
): number => {
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
