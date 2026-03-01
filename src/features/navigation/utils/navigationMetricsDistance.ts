export interface NormalizeTraveledDistanceParams {
  localTraveledDistanceMeter: number;
  baselineDistanceMeter: number | null;
  accumulatedTraveledDistanceMeter: number;
}

export const normalizeTraveledDistance = ({
  localTraveledDistanceMeter,
  baselineDistanceMeter,
  accumulatedTraveledDistanceMeter,
}: NormalizeTraveledDistanceParams) => {
  const nextBaselineDistanceMeter =
    baselineDistanceMeter ?? localTraveledDistanceMeter;

  const normalizedLocalTraveledDistanceMeter = Math.max(
    0,
    localTraveledDistanceMeter - nextBaselineDistanceMeter,
  );
  const finalTraveledDistanceMeter =
    normalizedLocalTraveledDistanceMeter + accumulatedTraveledDistanceMeter;

  return {
    nextBaselineDistanceMeter,
    normalizedLocalTraveledDistanceMeter,
    finalTraveledDistanceMeter,
  };
};
