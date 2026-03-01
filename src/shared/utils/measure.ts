import { Coordinate } from '@/shared/model/shared.types';
import {
  CALORIE_AGE_FACTORS,
  DEFAULT_CALORIE_AGE_FACTOR,
  MEAN_ACITIVITY_MET,
  MEAN_ADULT_PHYSICAL_INFORMATION,
  MEAN_CARBON_EMISSION,
} from '@/shared/model/shared.constants';
import { TransportationType, Gender } from '@/shared/model/shared.types';

// 좌표 두개 비교하여 거리 계산
export const getDistanceBetweenCoords = (
  prev: Coordinate,
  next: Coordinate,
): number => {
  const R = 6371e3; // 지구 반지름 (단위: m)
  const φ1 = (prev.lat * Math.PI) / 180; // 위도1 (라디안)
  const φ2 = (next.lat * Math.PI) / 180; // 위도2 (라디안)
  const Δφ = ((next.lat - prev.lat) * Math.PI) / 180; // 위도 차
  const Δλ = ((next.lng - prev.lng) * Math.PI) / 180; // 경도 차

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // 최종 거리 (미터)
  return d;
};

// 태어난 연도 범위 측정
export const getWeightByBirthYear = (
  birthYear?: number | null,
  today: Date = new Date()
): number => {
  if (!birthYear) return DEFAULT_CALORIE_AGE_FACTOR;

  const age = today.getFullYear() - birthYear;

  for (let i = CALORIE_AGE_FACTORS.length - 1; i >= 0; i--) {
    if (age >= CALORIE_AGE_FACTORS[i].minAge) {
      return CALORIE_AGE_FACTORS[i].weight;
    }
  }

  return DEFAULT_CALORIE_AGE_FACTOR;
};


export const measureCaloriesBurned = (
  transportationType: TransportationType,
  gender: Gender,
  deltaSeconds: number,
  birthYear?: number | null,
): number => {
  if (deltaSeconds <= 0) return 0;

  const { MEAN_WALKING_MET, MEAN_BIKING_MET } = MEAN_ACITIVITY_MET;
  const {
    MEAN_ADULT_MAN_WEIGHT_KG,
    MEAN_ADULT_WOMAN_WEIGHT_KG,
    MEAN_ADULT_NEUTRAL_WEIGHT_KG,
  } = MEAN_ADULT_PHYSICAL_INFORMATION;

  const weightFactorByBirthYear = getWeightByBirthYear(birthYear);
  const weightByPhysicalInformation =
    gender === 'M'
      ? MEAN_ADULT_MAN_WEIGHT_KG
      : gender === 'F'
      ? MEAN_ADULT_WOMAN_WEIGHT_KG
      : MEAN_ADULT_NEUTRAL_WEIGHT_KG;

  const met =
    transportationType === 'walking'
      ? MEAN_WALKING_MET
      : transportationType === 'biking'
      ? MEAN_BIKING_MET
      : 0;

  const hours = deltaSeconds / 3600;
  return met * weightFactorByBirthYear * weightByPhysicalInformation * hours;
};

export const measureCarbonSaved = (
  transportationType: TransportationType,
  distanceMeter: number,
): number => {
  const {
    EMISSION_CAR_PER_KM,
    EMISSION_WALKING_PER_KM,
    EMISSION_BIKING_PER_KM,
  } = MEAN_CARBON_EMISSION;
  const distanceKm = distanceMeter / 1000;
  const carEmissionKM = distanceKm * EMISSION_CAR_PER_KM;

  const userEmission =
    transportationType === 'walking'
      ? distanceKm * EMISSION_WALKING_PER_KM
      : distanceKm * EMISSION_BIKING_PER_KM;

  return carEmissionKM - userEmission;
};

export const convertToTrees = (carbonSavedKg: number) => {
  return Number((carbonSavedKg / 22).toFixed(2));
};
