import { getDistanceBetweenCoords } from '@/features/location/utils/location';
import {
  ACCURACY_OK,
  MOTION_COMMON_OPTIONS,
  TRAVELED_DISTANCE_OPTIONS,
} from '@/features/navigation/model/navigation.constants';
import {
  DistanceType,
  IntervalPathData,
  LocationMetaData,
  NavigationInstruction,
  StabilizeDistanceInput,
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
/**
 * polyline의 "선분" 기준으로
 * 내 위치에 가장 가까운 선분의 시작점 index를 반환
 *
 */
export const findClosestCoordIndex = (
  myPosition: Coordinate,
  coordinateList: Coordinate[],
): number => {
  if (coordinateList.length === 0) return 0;
  if (coordinateList.length === 1) return 0;

  let bestIdx = 0;
  let bestDistance = Infinity;

  // 위경도를 로컬 평면(m 단위)으로 근사
  const lat0 = myPosition.lat;
  const meterPerDegLat = 111_320;
  const meterPerDegLng = 111_320 * Math.cos((lat0 * Math.PI) / 180);

  const toXY = (p: Coordinate) => ({
    x: (p.lng - myPosition.lng) * meterPerDegLng,
    y: (p.lat - myPosition.lat) * meterPerDegLat,
  });

  for (let i = 0; i < coordinateList.length - 1; i++) {
    const a = coordinateList[i];
    const b = coordinateList[i + 1];

    const A = toXY(a);
    const B = toXY(b);

    const ABx = B.x - A.x;
    const ABy = B.y - A.y;
    const denom = ABx * ABx + ABy * ABy;

    let distToSegment: number;

    if (denom === 0) {
      // a == b (이상 케이스)
      distToSegment = getDistanceBetweenCoords(myPosition, a);
    } else {
      // P=(0,0)을 AB에 투영
      const t = (-A.x * ABx + -A.y * ABy) / denom;

      const tClamped = Math.max(0, Math.min(1, t));

      const projX = A.x + ABx * tClamped;
      const projY = A.y + ABy * tClamped;

      distToSegment = Math.sqrt(projX * projX + projY * projY);
    }

    if (distToSegment < bestDistance) {
      bestDistance = distToSegment;
      bestIdx = i;
    }
  }

  return bestIdx;
};

/**
 * 현재 인터벌 기준 거리 계산 (type으로 traveled/remaining 분기)
 * - traveled: 인터벌 시작점 -> 내 위치까지 "지나온 거리"
 * - remaining: 내 위치 -> 인터벌 마지막점까지 "남은 거리"
 *
 * 계산 방식:
 * - interval 좌표가 2개 이상:
 *    traveled  = (start -> closest) + polyline(start..closest)
 *    remaining = (myPos -> closest) + polyline(closest..end)
 * - interval 좌표가 1개:
 *    traveled  = (onlyCoord -> myPos)
 *    remaining = (myPos -> onlyCoord)
 * - interval 좌표 없음: 0
 */
export const calculateIntervalDistanceByMyPosition = (
  myPosition: Coordinate,
  pathDataListByInterval: IntervalPathData[],
  currentIntervalIndex: number,
  type: DistanceType,
) => {
  const intervalCoordinateList =
    pathDataListByInterval[currentIntervalIndex]?.coordinateList ?? [];

  let distanceMeter = 0;

  // case 1: 현재 인터벌 좌표가 2개 이상일 때
  if (intervalCoordinateList.length > 1) {
    const closestIdx = findClosestCoordIndex(
      myPosition,
      intervalCoordinateList,
    );
    const closestCoord = intervalCoordinateList[closestIdx];

    if (type === 'traveled') {
      // 1) start -> closest (직선) + 2) start..closest polyline 누적
      distanceMeter += getDistanceBetweenCoords(
        intervalCoordinateList[0],
        closestCoord,
      );

      for (let i = 0; i < closestIdx; i++) {
        distanceMeter += getDistanceBetweenCoords(
          intervalCoordinateList[i],
          intervalCoordinateList[i + 1],
        );
      }
    }

    if (type === 'remaining') {
      // 1) myPos -> closest (직선) + 2) closest..end polyline 누적
      distanceMeter += getDistanceBetweenCoords(myPosition, closestCoord);

      for (let i = closestIdx; i < intervalCoordinateList.length - 1; i++) {
        distanceMeter += getDistanceBetweenCoords(
          intervalCoordinateList[i],
          intervalCoordinateList[i + 1],
        );
      }
    }
  }

  // case 2: 현재 인터벌 좌표가 1개일 때
  if (intervalCoordinateList.length === 1) {
    // traveled/remaining 모두 사실상 같은 값(직선거리)로 계산됨
    // (onlyCoord <-> myPos)
    distanceMeter += getDistanceBetweenCoords(
      intervalCoordinateList[0],
      myPosition,
    );
  }

  // case 3: 현재 인터벌 좌표가 없을 때
  if (intervalCoordinateList.length === 0) {
    distanceMeter = 0;
  }

  return distanceMeter;
};

/* 남은 거리 측정
1. 현재 내가 속한 인터벌의 "내 위치 ~ 인터벌 lastCoordinate" 남은 거리 계산(보정 필요)
2. 남은 인터벌의 distance 합산
3. (1)+(2)로 전체 남은 거리 계산
4. 안정화 - 튐 방지 보정:
   - 남은거리 증가 금지
   - 최대 속도 기반 변화폭 제한
   - 정지 판정 시 변화 억제
*/

export const calculateRemainingDistance = (
  myPosition: Coordinate,
  pathDataListByInterval: IntervalPathData[],
  currentIntervalIndex: number,
  instructionList: NavigationInstruction[],

  // 안정화(튐 방지)용 입력
  prevRemainingDistanceMeter: number,
  prevMyPositionForRemaining: Coordinate | null,
  prevTimestampForRemaining: number | null,
  currentTimestamp: number,
) => {
  const { MAX_PHYSICAL_SPEED_MPS } = MOTION_COMMON_OPTIONS;

  // =========================
  // 0) dtSec 계산 (물리적 증가 제한에 필요)
  // =========================
  const dtSec =
    prevTimestampForRemaining !== null
      ? Math.max(0.001, (currentTimestamp - prevTimestampForRemaining) / 1000)
      : null;

  // =========================
  // 0-1) GPS 점프 판정 (강한 컷)
  // =========================
  if (prevMyPositionForRemaining && dtSec !== null) {
    const movedMeter = getDistanceBetweenCoords(
      prevMyPositionForRemaining,
      myPosition,
    );

    const instantSpeedMps = movedMeter / dtSec;

    // 물리적으로 불가능한 이동 → GPS 점프
    if (instantSpeedMps > MAX_PHYSICAL_SPEED_MPS) {
      return prevRemainingDistanceMeter;
    }
  }
  // =========================
  // 1) 내 위치 기준 현재 인터벌 남은 거리 계산
  // =========================
  const fromMyPositionToLastIntervalCoordDistance =
    calculateIntervalDistanceByMyPosition(
      myPosition,
      pathDataListByInterval,
      currentIntervalIndex,
      'remaining',
    );
  // =========================
  // 2) 남은 인터벌 거리 합산
  // =========================
  let remainingIntervalsDistance = 0;

  if (currentIntervalIndex < instructionList.length - 1) {
    for (let i = currentIntervalIndex + 1; i < instructionList.length; i++) {
      remainingIntervalsDistance += instructionList[i].distance;
    }
  }

  // =========================
  // 3) 전체 남은 거리 "raw"
  // =========================
  const newlyComputedRemainingDistanceMeter = Math.round(
    fromMyPositionToLastIntervalCoordDistance + remainingIntervalsDistance,
  );

  // =========================
  // 4) 안정화 (remaining은 "증가 금지"가 핵심)
  // =========================
  const stabilizedRemainingDistanceMeter = stabilizeDistance({
    newlyComputedDistanceMeter: newlyComputedRemainingDistanceMeter,
    prevStableDistanceMeter: prevRemainingDistanceMeter,
    prevMyPosition: prevMyPositionForRemaining,
    currentMyPosition: myPosition,
    prevTimestamp: prevTimestampForRemaining,
    currentTimestamp,
    type: 'remaining',
  });

  return stabilizedRemainingDistanceMeter;
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

export const returnAccurateSpeed = (
  prevLocationMetaData: LocationMetaData,
  currentLocationMetaData: LocationMetaData,
  prevEmaSpeed?: number,
) => {
  const dt =
    (currentLocationMetaData.timestamp - prevLocationMetaData.timestamp) / 1000;
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

    if (dt <= 0 || !Number.isFinite(dt)) return ema(prevBase, 0);

    // accuracy가 40 이하라면 OS speed 사용
    if (currentLocationMetaData.accuracy! <= ACCURACY_OK) {
      return ema(prevBase, currentLocationMetaData.osSpeed!);
    }

    // accuracy가 40 초과라면 직접 계산
    const distanceMeter = getDistanceBetweenCoords(
      prevLocationMetaData.coordinate,
      currentLocationMetaData.coordinate,
    );
    const rawSpeedMps = distanceMeter / dt;

    if (!Number.isFinite(rawSpeedMps)) return ema(prevBase, 0);

    return ema(prevBase, rawSpeedMps);
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
  const rawSpeedMps = distanceM / dt; // m/s
  const prevBase = hasNum(prevEmaSpeed)
    ? prevEmaSpeed
    : hasNum(prevLocationMetaData.osSpeed)
    ? prevLocationMetaData.osSpeed
    : rawSpeedMps;

  // 속도값이 비정상적이면 0으로 처리
  if (!Number.isFinite(rawSpeedMps)) return ema(prevBase, 0);

  return ema(prevBase, rawSpeedMps);
};

// 예상 도착 시간 계산
export const calculateEta = (
  totalRemainingDistanceMeter: number,
  currentEmaSpeedMps: number,
) => {
  if (currentEmaSpeedMps <= 0) return undefined;
  if (totalRemainingDistanceMeter <= 0) return undefined;

  const remainingTimeSec = totalRemainingDistanceMeter / currentEmaSpeedMps;
  return new Date(Date.now() + remainingTimeSec * 1000);
};
/* 소요 거리 측정
1. 현재 내가 속한 인터벌의 firstCoordinate와 현재 내 좌표간 거리 계산(보정 필요)
2. 지난 인터벌의 거리 합산
3. (1)+(2)로 전체 소요 거리 계산
4. 안정화 - 튐 방지 보정:
   - 진행거리 감소 금지
   - 최대 속도 기반 증가 제한
   - 정지 판정 시 증가 억제
*/
export const calculateTraveledDistance = (
  myPosition: Coordinate,
  pathDataListByInterval: IntervalPathData[],
  currentIntervalIndex: number,
  instructionList: NavigationInstruction[],

  // 안정화(튐 방지)용 입력
  prevTraveledDistanceMeter: number, // 이전에 확정해서 UI에 보여주던 진행거리
  prevMyPositionForTravel: Coordinate | null, // 이전 위치(정지 판정)
  prevTimestampForTravel: number | null, // 이전 타임스탬프(ms)
  currentTimestamp: number, // 현재 타임스탬프(ms)
) => {
  const { MAX_PHYSICAL_SPEED_MPS } = MOTION_COMMON_OPTIONS;

  // =========================
  // 0) dtSec 계산 (물리적 증가 제한에 필요)
  // =========================
  const dtSec =
    prevTimestampForTravel !== null
      ? Math.max(0.001, (currentTimestamp - prevTimestampForTravel) / 1000)
      : null;

  // =========================
  // 0-1) GPS 점프 판정 (강한 컷)
  // =========================
  if (prevMyPositionForTravel && dtSec !== null) {
    const movedMeter = getDistanceBetweenCoords(
      prevMyPositionForTravel,
      myPosition,
    );

    const instantSpeedMps = movedMeter / dtSec;

    // 물리적으로 불가능한 이동 → GPS 점프
    if (instantSpeedMps > MAX_PHYSICAL_SPEED_MPS) {
      return prevTraveledDistanceMeter;
    }

    // 정지 판정 추가 - 이동 거리가 너무 작으면 이전 값 유지
    const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;
    if (movedMeter < STOP_JUDGE_MOVE_METER) {
      return prevTraveledDistanceMeter;
    }
  }

  // =========================
  // 1) 내 위치 기준 현재 인터벌 지난 거리 계산
  // =========================
  const fromFirstIntervalCoordToMyPositionDistance =
    calculateIntervalDistanceByMyPosition(
      myPosition,
      pathDataListByInterval,
      currentIntervalIndex,
      'traveled',
    );

  // =========================
  // 2) 지난 인터벌 거리 합산
  // =========================
  let traveledIntervalsDistance = 0;

  // 첫 인터벌이 아닐 때만 계산
  if (currentIntervalIndex > 0) {
    for (let i = 0; i < currentIntervalIndex; i++) {
      traveledIntervalsDistance += instructionList[i].distance;
    }
  }

  // =========================
  // 3) 전체 소요 거리 "raw" 계산
  // =========================
  const newlyComputedTraveledDistanceMeter =
    Math.round(
      (fromFirstIntervalCoordToMyPositionDistance + traveledIntervalsDistance) *
        100,
    ) / 100;

  // =========================
  // 4) 안정화 - 튐 방지 보정 (모듈화 버전)
  // =========================
  const stabilizedTraveledDistanceMeter = stabilizeDistance({
    newlyComputedDistanceMeter: newlyComputedTraveledDistanceMeter,
    prevStableDistanceMeter: prevTraveledDistanceMeter,
    prevMyPosition: prevMyPositionForTravel,
    currentMyPosition: myPosition,
    prevTimestamp: prevTimestampForTravel,
    currentTimestamp,
    type: 'traveled',
  });

  return stabilizedTraveledDistanceMeter;
};

// 안정화 - 튐 방지 보정 (거리 측정용)
// traveled: 감소 금지, remaining: 증가 금지
export const stabilizeDistance = ({
  newlyComputedDistanceMeter,
  prevStableDistanceMeter,
  prevMyPosition,
  currentMyPosition,
  prevTimestamp,
  currentTimestamp,
  type,
}: StabilizeDistanceInput) => {
  const { MAX_PHYSICAL_SPEED_MPS } = MOTION_COMMON_OPTIONS;
  const { STOP_JUDGE_MOVE_METER } = TRAVELED_DISTANCE_OPTIONS;

  // =========================
  // 0) dtSec 계산
  // =========================
  const dtSec =
    prevTimestamp !== null
      ? Math.max(0.001, (currentTimestamp - prevTimestamp) / 1000)
      : null;

  // =========================
  // 1) type별 "단조성(monotonic)" 보장
  // =========================
  // traveled: 내려가면 안됨
  // remaining: 올라가면 안됨
  let stabilizedDistanceMeter =
    type === 'traveled'
      ? Math.max(prevStableDistanceMeter, newlyComputedDistanceMeter)
      : Math.min(prevStableDistanceMeter, newlyComputedDistanceMeter);

  // =========================
  // 2) 정지 판정이면 변화 막기
  // =========================
  if (prevMyPosition) {
    const movedDistanceMeter = getDistanceBetweenCoords(
      prevMyPosition,
      currentMyPosition,
    );

    if (movedDistanceMeter < STOP_JUDGE_MOVE_METER) {
      return Math.round(prevStableDistanceMeter);
    }
  }

  // =========================
  // 3) 최대 물리 속도 기반 "변화 최대폭" 제한 (GPS 점프 컷)
  // =========================
  if (dtSec !== null) {
    const maxChangeDistanceMeter = MAX_PHYSICAL_SPEED_MPS * dtSec;

    if (type === 'traveled') {
      stabilizedDistanceMeter = Math.min(
        stabilizedDistanceMeter,
        prevStableDistanceMeter + maxChangeDistanceMeter,
      );
    }
    if (type === 'remaining') {
      stabilizedDistanceMeter = Math.max(
        stabilizedDistanceMeter,
        prevStableDistanceMeter - maxChangeDistanceMeter,
      );
    }
  }

  return Math.round(stabilizedDistanceMeter);
};
