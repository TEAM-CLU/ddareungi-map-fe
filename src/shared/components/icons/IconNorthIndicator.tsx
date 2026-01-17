import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconNorthIndicatorProps {
  width?: number;
  height?: number;
  fillColor?: string;
}

const IconNorthIndicator = ({
  width = 25,
  height = 25,
  fillColor = '#01DA86',
}: IconNorthIndicatorProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5165 0V5H11.4545V1.73925L13.4703 5H14.4835V0H13.5455V3.33875L11.499 0H10.5165ZM11.909 6.672L5.4665 24.1593C5.26075 24.7188 5.881 25.2212 6.38575 24.9037L12.5 21.0487L18.6138 24.9037C19.1188 25.222 19.7398 24.7193 19.5338 24.1593L13.0863 6.65925C12.9683 6.38525 12.7655 6.25125 12.4903 6.2505C12.215 6.24975 11.9858 6.4645 11.909 6.672ZM11.8753 10.3795V19.965L7.275 22.8657L11.8753 10.3795Z"
        fill={fillColor}
      />
    </Svg>
  );
};

export default React.memo(IconNorthIndicator);
