import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconRefreshProps {
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const IconRefresh = ({
  color = 'white',
  width = 24,
  height = 24,
  strokeWidth = 2,
}: IconRefreshProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 15L10 19L14 23"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.93782 15.5C5.16735 14.1655 4.85875 12.6141 5.05989 11.0863C5.26102 9.55856 5.96064 8.13986 7.05025 7.05025C8.13986 5.96064 9.55856 5.26102 11.0863 5.05989C12.6141 4.85875 14.1655 5.16735 15.5 5.93782C16.8345 6.70829 17.8775 7.89757 18.4672 9.32122C19.0568 10.7449 19.1603 12.3233 18.7615 13.8117C18.3627 15.3002 17.4838 16.6154 16.2613 17.5535C15.0388 18.4915 13.5409 19 12 19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default React.memo(IconRefresh);
