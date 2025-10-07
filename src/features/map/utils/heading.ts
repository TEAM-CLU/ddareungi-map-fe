// 방향 보정
export const norm360 = (x: number) => ((x % 360) + 360) % 360;
export const angleDiff = (a: number, b: number) => {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};
export const lerpAngle = (prev: number, next: number, t: number) => {
  const delta = ((next - prev + 540) % 360) - 180; // -180..+180
  return norm360(prev + delta * t);
};
