import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconRecommendedPathProps {
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const IconRecommendedPath = ({
  color = 'white',
  width = 32,
  height = 32,
  strokeWidth = 2.2,
}: IconRecommendedPathProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 29 29" fill="none">
      <Path
        d="M24.1666 13.8958C24.1666 20.1067 16.7445 24.2468 14.9075 25.1764C14.6499 25.3067 14.35 25.3067 14.0925 25.1764C12.2555 24.2468 4.83331 20.1067 4.83331 13.8958C4.83331 8.45825 9.51714 4.83325 14.5 4.83325C19.6555 4.83325 24.1666 8.45825 24.1666 13.8958Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M10.8389 14.2712L14.2364 17.8474C14.3601 17.9776 14.422 18.0428 14.5 18.0428C14.5781 18.0428 14.6399 17.9776 14.7637 17.8474L18.1611 14.2712C18.8503 13.5457 18.9581 12.4446 18.4227 11.5993C17.5311 10.1915 15.4545 10.2613 14.6595 11.7259L14.5754 11.8808C14.5429 11.9406 14.4571 11.9406 14.4247 11.8808L14.3405 11.7259C13.5455 10.2613 11.469 10.1915 10.5773 11.5993C10.042 12.4446 10.1498 13.5457 10.8389 14.2712Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default React.memo(IconRecommendedPath);
