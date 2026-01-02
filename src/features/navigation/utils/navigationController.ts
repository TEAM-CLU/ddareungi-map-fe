import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import { ACCURACY_OK } from '@/features/navigation/model/navigation.constants';
import {
  IntervalPathData,
  LocationMetaData,
  NavigationInstruction,
} from '@/features/navigation/model/navigation.types';
import { Coordinate } from '@/features/routing/model/routing.types';

/* 예상 도착 시간 계산 (예: "12:07AM"), 남은 거리 계산 (예: "1.8km")
 1. 현재 내가 속한 인터벌의 lastCoordinate와 현재 내 좌표간 거리 계산(보정 필요)
 2. 남은 인터벌의 거리 합산
 3. (1)+(2)로 전체 남은 거리 계산
 4. 현재 속도(최근 위치 변화량으로 계산)로 남은 시간 계산
 5. 현재 시간에 (4) 더해서 예상 도착 시간 계산
*/

// 인터벌 좌표중 가장 가까운 인덱스 찾기 - helper
const findClosestCoordIndex = (
  myPosition: Coordinate,
  intervalCoordinateList: Coordinate[],
) => {
  let bestIdx = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < intervalCoordinateList.length; i++) {
    const d = getDistanceBetweenCoords(myPosition, intervalCoordinateList[i]);
    if (d < bestDistance) {
      bestDistance = d;
      bestIdx = i;
    }
  }
  return bestIdx;
};

export const calculateRemainingDistanceMeter = (
  myPosition: Coordinate,
  pathDataListByInterval: IntervalPathData[],
  currentIntervalIndex: number,
  instructionList: NavigationInstruction[],
) => {
  //1. 내 위치 기준 현재 인터벌 남은 거리 계산
  const intervalCoordinateList =
    pathDataListByInterval[currentIntervalIndex].coordinateList ?? [];

  let fromMyPositionToLastIntervalCoordDistance = 0;

  // case 1: 현재 인터벌 좌표가 2개 이상일 때
  if (intervalCoordinateList.length > 1) {
    // 1.1-1) 현재 인터벌 좌표중 내위치로부터 가장 가까운 점 인덱스
    const closetCoordinateIdx = findClosestCoordIndex(
      myPosition,
      intervalCoordinateList,
    );
    // 1.1-2) 가장 가까운 점 좌표 찾기
    const closetCoordinate = intervalCoordinateList[closetCoordinateIdx];

    // 1.1-3) 현재 인터벌에서 "내 위치 ~ 인터벌 끝"까지 폴리라인 남은 거리

    // 1.1-3-a) 내 위치 → 가장 가까운 경로 점 거리 일단 계산
    fromMyPositionToLastIntervalCoordDistance += getDistanceBetweenCoords(
      myPosition,
      closetCoordinate,
    );

    // 1.1-3-b) 가장 가까운 경로 점부터 마지막 점까지 polyline 누적
    for (
      let i = closetCoordinateIdx;
      i < intervalCoordinateList.length - 1;
      i++
    ) {
      fromMyPositionToLastIntervalCoordDistance += getDistanceBetweenCoords(
        intervalCoordinateList[i],
        intervalCoordinateList[i + 1],
      );
    }
  }

  // case 2: 현재 인터벌 좌표가 1개일 때
  if (intervalCoordinateList.length === 1) {
    fromMyPositionToLastIntervalCoordDistance += getDistanceBetweenCoords(
      myPosition,
      intervalCoordinateList[0],
    );
  }

  // case 3: 현재 인터벌 좌표가 없을 때
  if (intervalCoordinateList.length === 0) {
    fromMyPositionToLastIntervalCoordDistance = 0;
  }

  // 2. 남은 인터벌 거리 합산
  let remainingIntervalsDistance = 0;
  // 마지막 인터벌이 아닐 때만 계산
  if (currentIntervalIndex < instructionList.length - 1) {
    for (let i = currentIntervalIndex + 1; i < instructionList.length; i++) {
      remainingIntervalsDistance += instructionList[i].distance;
    }
  }

  // 3. 전체 남은 거리 계산
  const totalRemainingDistanceMeter =
    Math.round(
      (fromMyPositionToLastIntervalCoordDistance + remainingIntervalsDistance) *
        100,
    ) / 100;

  return totalRemainingDistanceMeter; // ex) "1.83"
};

// 지수이동평균 계산식: 속도 변동을 부드럽게 하기 위해 사용, 노이즈 감소 목적(ex: 사용자가 멈춰있어서 계속 0이니 아니면, 튀어서 0이니 등을 고려) helper
const ema = (
  prevSpeedMeter: number,
  currentSpeedMeter: number,
  alpha = 0.2,
) => {
  return alpha * currentSpeedMeter + (1 - alpha) * prevSpeedMeter;
};

// 값 존재 확인 helper
const hasNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

export const returnAccurateSpeedMeter = (
  prevLocationMetaData: LocationMetaData,
  currentLocationMetaData: LocationMetaData,
  prevEmaSpeed?: number,
) => {
  const dt =
    (currentLocationMetaData.timestemp - prevLocationMetaData.timestemp) / 1000;
  if (
    hasNum(prevLocationMetaData?.accuracy) &&
    hasNum(prevLocationMetaData?.osSpeed) &&
    hasNum(currentLocationMetaData?.accuracy) &&
    hasNum(currentLocationMetaData?.osSpeed)
  ) {
    // case 1: OS 속도, accuracy 모두 존재할 때

    // 이전 EMA 속도값이 있으면 그것을 베이스로, 없으면 OS 속도를 베이스로 사용, 누적 ema 계산
    const prevBase = hasNum(prevEmaSpeed)
      ? prevEmaSpeed
      : prevLocationMetaData.osSpeed!;
    // accuracy가 40 이하라면 OS speed 사용
    if (currentLocationMetaData.accuracy! <= ACCURACY_OK) {
      return ema(prevBase, currentLocationMetaData.osSpeed!);
    }

    // accuracy가 40 초과라면 직접 계산
    if (dt <= 0 || !Number.isFinite(dt)) return ema(prevBase, 0);
    const distanceMeter = getDistanceBetweenCoords(
      prevLocationMetaData.coordinate,
      currentLocationMetaData.coordinate,
    );
    const rawSpeedMeterPerSec = distanceMeter / dt;

    if (!Number.isFinite(rawSpeedMeterPerSec)) return ema(prevBase, 0);

    return ema(prevBase, rawSpeedMeterPerSec);
  }

  // case 2: OS 속도 또는 accuracy가 없을 때 직접 계산
  if (dt <= 0 || !Number.isFinite(dt)) {
    const prevBase = hasNum(prevEmaSpeed)
      ? prevEmaSpeed
      : hasNum(prevLocationMetaData.osSpeed)
      ? prevLocationMetaData.osSpeed
      : 0;

    return ema(prevBase, 0);
  }

  const distanceM = getDistanceBetweenCoords(
    prevLocationMetaData.coordinate,
    currentLocationMetaData.coordinate,
  );
  const rawSpeedMeterPerSec = distanceM / dt; // m/s
  const prevBase = hasNum(prevEmaSpeed)
    ? prevEmaSpeed
    : hasNum(prevLocationMetaData.osSpeed)
    ? prevLocationMetaData.osSpeed
    : rawSpeedMeterPerSec;

  // 속도값이 비정상적이면 0으로 처리
  if (!Number.isFinite(rawSpeedMeterPerSec)) return ema(prevBase, 0);

  return ema(prevBase, rawSpeedMeterPerSec);
};

// 예상 도착 시간 계산
export const calculateEta = (
  totalRemainingDistanceMeter: number,
  currentEmaSpeedMeterPerSec: number,
) => {
  if (currentEmaSpeedMeterPerSec <= 0) return undefined;
  if (totalRemainingDistanceMeter <= 0) return undefined;

  const remainingTimeSec =
    totalRemainingDistanceMeter / currentEmaSpeedMeterPerSec;

  return new Date(Date.now() + remainingTimeSec * 1000);
};

/* 소요 거리 측정
1. 현재 내가 속한 인터벌의 firstCoordinate와 현재 내 좌표간 거리 계산(보정 필요)
2. 지난 인터벌의 거리 합산
3. (1)+(2)로 전체 소요 거리 계산
*/

export const calculateTraveledDistanceMeter = (
  myPosition: Coordinate,
  pathDataListByInterval: IntervalPathData[],
  currentIntervalIndex: number,
  instructionList: NavigationInstruction[],
) => {
  //1. 내 위치 기준 현재 인터벌 지난 거리 계산
  const intervalCoordinateList =
    pathDataListByInterval[currentIntervalIndex].coordinateList ?? [];

  let fromFirstIntervalCoordToMyPositionDistance = 0;

  // case 1: 현재 인터벌 좌표가 2개 이상일 때
  if (intervalCoordinateList.length > 1) {
    // 1.1-1) 현재 인터벌 좌표중 내위치로부터 가장 가까운 점 인덱스
    const closetCoordinateIdx = findClosestCoordIndex(
      myPosition,
      intervalCoordinateList,
    );
    // 1.1-2) 가장 가까운 점 좌표 찾기
    const closetCoordinate = intervalCoordinateList[closetCoordinateIdx];

    // 1.1-3) 현재 인터벌에서 "인터벌 시작 ~ 내 위치"까지 폴리라인 지난 거리

    // 1.1-3-a) 인터벌 시작점 → 가장 가까운 경로 점 거리 일단 계산
    fromFirstIntervalCoordToMyPositionDistance += getDistanceBetweenCoords(
      intervalCoordinateList[0],
      closetCoordinate,
    );

    // 1.1-3-b) 가장 가까운 경로 점부터 첫 점까지 polyline 누적
    for (let i = 0; i < closetCoordinateIdx; i++) {
      fromFirstIntervalCoordToMyPositionDistance += getDistanceBetweenCoords(
        intervalCoordinateList[i],
        intervalCoordinateList[i + 1],
      );
    }
  }

  // case 2: 현재 인터벌 좌표가 1개일 때
  if (intervalCoordinateList.length === 1) {
    fromFirstIntervalCoordToMyPositionDistance += getDistanceBetweenCoords(
      intervalCoordinateList[0],
      myPosition,
    );
  }

  // case 3: 현재 인터벌 좌표가 없을 때
  if (intervalCoordinateList.length === 0) {
    fromFirstIntervalCoordToMyPositionDistance = 0;
  }

  // 2. 지난 인터벌 거리 합산
  let traveledIntervalsDistance = 0;
  // 첫 인터벌이 아닐 때만 계산
  if (currentIntervalIndex > 0) {
    for (let i = 0; i < currentIntervalIndex; i++) {
      traveledIntervalsDistance += instructionList[i].distance;
    }
  }

  // 3. 전체 소요 거리 계산
  const totalTraveledDistanceMeter =
    Math.round(
      (fromFirstIntervalCoordToMyPositionDistance + traveledIntervalsDistance) *
        100,
    ) / 100;

  return totalTraveledDistanceMeter; // ex) "1.83"
};
