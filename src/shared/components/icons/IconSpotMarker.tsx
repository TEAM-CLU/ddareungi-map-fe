import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconSpotMarkerProps {
  color?: string;
  innerColor?: string;
  width?: number;
  height?: number;
}

const IconSpotMarker = ({
  color = '#01DA86',
  innerColor = 'white',
  width = 27,
  height = 32,
}: IconSpotMarkerProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 27 32" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.1818 13.0909C26.1818 23.2727 13.0909 32 13.0909 32C13.0909 32 0 23.2727 0 13.0909C0 5.861 5.861 0 13.0909 0C20.3208 0 26.1818 5.861 26.1818 13.0909Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.0907 17.4543C15.5007 17.4543 17.4543 15.5007 17.4543 13.0907C17.4543 10.6807 15.5007 8.72705 13.0907 8.72705C10.6807 8.72705 8.72705 10.6807 8.72705 13.0907C8.72705 15.5007 10.6807 17.4543 13.0907 17.4543Z"
        fill={innerColor}
      />
    </Svg>
  );
};

export default IconSpotMarker;
