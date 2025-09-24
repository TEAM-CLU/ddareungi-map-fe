import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface IconBikeMarkerProps {
  color?: string;
  borderColor?: string;
  width?: number;
  height?: number;
}

const IconBikeMarker = ({
  color = 'white',
  borderColor = '#01DA86',
  width = 41,
  height = 48,
}: IconBikeMarkerProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 41 48" fill="none">
      <G>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M36 16.5C36 28.5556 20.5 38.8889 20.5 38.8889C20.5 38.8889 5 28.5556 5 16.5C5 7.93959 11.9396 1 20.5 1C29.0604 1 36 7.93959 36 16.5Z"
          fill={color}
          stroke={borderColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default IconBikeMarker;
