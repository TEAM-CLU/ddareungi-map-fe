export function formatPace(minPerKm: number | null): string {
  if (minPerKm == null) return '--:--';
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
