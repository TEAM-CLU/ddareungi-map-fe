export const formatUsageData = (data: {
  totalDistance: number | null; // meter
  totalTime: number | null; // second
  calories: number | null; // kcal
}) => {
  const totalDistance = data.totalDistance ?? 0;
  const totalTime = data.totalTime ?? 0;
  const calories = data.calories ?? 0;

  // 시간: 초 → 시/분
  const totalMinutes = Math.floor(totalTime / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const formattedTime =
    hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

  // 거리: 미터 → 킬로미터 (소수점 1자리)
  const distanceInKm = totalDistance / 1000;
  const formattedDistance =
    distanceInKm % 1 === 0
      ? `${distanceInKm.toFixed(0)}km`
      : `${distanceInKm.toFixed(1)}km`;

  // 칼로리: 그대로 표시 + 3자리 콤마
  const formattedCalories = `${(calories ?? 0).toLocaleString()}kcal`;

  return {
    time: formattedTime,
    distance: formattedDistance,
    calorie: formattedCalories,
  };
};
