import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconRouteMarkerProps {
  type: 'start' | 'destination';
  width?: number;
  height?: number;
}

const IconRouteMarker = ({
  type,
  width = 32,
  height = 40,
}: IconRouteMarkerProps) => {
  const fillColor = type === 'start' ? '#006AFF' : '#FF0000';

  return (
    <Svg width={width} height={height} viewBox="0 0 32 40" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 16.3636C32 29.0909 16 40 16 40C16 40 0 29.0909 0 16.3636C0 7.32625 7.16344 0 16 0C24.8366 0 32 7.32625 32 16.3636Z"
        fill={fillColor}
      />
    </Svg>
  );
};

export default React.memo(IconRouteMarker);
