import { Coordinate } from '@/shared/model/shared.types';
import { calculateMotionVector } from '@/features/navigation/utils/calculateMotionVector';
import { OffRouteRecoveryGuardState } from '@/features/navigation/model/navigation.types';

interface RecoveryGuardParams {
  state: OffRouteRecoveryGuardState;
  tickNowMs: number;
  minDistanceMeter: number;
  recoveryTriggerMeter: number;
  maxTriggerCount: number;
  countDecay: number;
  isMovingTowardRoute: boolean;
}

export const createInitialOffRouteRecoveryGuardState =
  (): OffRouteRecoveryGuardState => ({
    lockUntilMs: 0,
    unlockCount: 0,
    shouldRequireUnlock: false,
    isUnlocked: false,
    prevPosition: null,
    prevTimestamp: null,
  });

export const resetOffRouteRecoveryGuardState = (
  state: OffRouteRecoveryGuardState,
) => {
  state.lockUntilMs = 0;
  state.unlockCount = 0;
  state.shouldRequireUnlock = false;
  state.isUnlocked = false;
  state.prevPosition = null;
  state.prevTimestamp = null;
};

export const getIsMovingTowardRoute = (
  state: OffRouteRecoveryGuardState,
  currentPosition: Coordinate,
  targetPosition: Coordinate | null,
  tickNowMs: number,
) => {
  const prevPosition = state.prevPosition;
  const prevTimestamp = state.prevTimestamp;
  let isMovingTowardRoute = false;

  if (prevPosition && prevTimestamp != null && targetPosition) {
    const dtSec = Math.max(0.001, (tickNowMs - prevTimestamp) / 1000);
    const { dot } = calculateMotionVector(
      prevPosition,
      currentPosition,
      targetPosition,
      dtSec,
    );
    isMovingTowardRoute = dot > 0;
  }

  state.prevPosition = currentPosition;
  state.prevTimestamp = tickNowMs;

  return isMovingTowardRoute;
};

export const evaluateRecoveryAvailability = ({
  state,
  tickNowMs,
  minDistanceMeter,
  recoveryTriggerMeter,
  maxTriggerCount,
  countDecay,
  isMovingTowardRoute,
}: RecoveryGuardParams) => {
  const isRecoveryLockActive = tickNowMs < state.lockUntilMs;

  // lock 해제 후에는 "3회 연속 접근(방향벡터 + 근접)"일 때만 recovery 잠금 해제
  if (
    state.shouldRequireUnlock &&
    !isRecoveryLockActive &&
    !state.isUnlocked
  ) {
    const isUnlockCandidate =
      minDistanceMeter <= recoveryTriggerMeter && isMovingTowardRoute;

    if (isUnlockCandidate) {
      state.unlockCount = Math.min(maxTriggerCount, state.unlockCount + 1);
    } else {
      state.unlockCount = Math.max(0, state.unlockCount - countDecay);
    }

    if (state.unlockCount >= maxTriggerCount) {
      state.isUnlocked = true;
      state.shouldRequireUnlock = false;
      state.unlockCount = 0;
    }
  }

  const canUseRecovery =
    !isRecoveryLockActive && (!state.shouldRequireUnlock || state.isUnlocked);

  return { canUseRecovery, isRecoveryLockActive };
};

export const lockRecoveryAfterReroute = (
  state: OffRouteRecoveryGuardState,
  tickNowMs: number,
  lockMs: number,
) => {
  state.lockUntilMs = tickNowMs + lockMs;
  state.shouldRequireUnlock = true;
  state.isUnlocked = false;
  state.unlockCount = 0;
};
