export const createStableColorByIndex = (index: number) => {
  const hue = (index * 137.508) % 360;
  const saturation = 70;
  const lightness = 50;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
