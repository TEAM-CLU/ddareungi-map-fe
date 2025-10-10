import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface IconOvalProps {
  color?: 'brand' | 'gray';
  width?: number;
  height?: number;
}

const IconOval: React.FC<IconOvalProps> = ({
  color = 'gray',
  width = 12,
  height = 12,
}) => {
  const baseColor = color === 'brand' ? '#10B981' : '#6B7280';
  const gradientId = `gradient-${color}`;

  return (
    <Svg width={width} height={height} viewBox="0 0 12 12">
      <Defs>
        <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={baseColor} stopOpacity="0.8" />
          <Stop offset="70%" stopColor={baseColor} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={baseColor} stopOpacity="0.1" />
        </RadialGradient>
      </Defs>
      <Circle cx="6" cy="6" r="5.5" fill={`url(#${gradientId})`} />
      <Circle cx="6" cy="6" r="2.5" fill={baseColor} />
    </Svg>
  );
};

export default IconOval;
