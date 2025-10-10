import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconPlaceProps {
  width?: number;
  height?: number;
  color?: string;
}

const IconPlace = ({ width = 15, height = 18, color = '#77838F' }: IconPlaceProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 15 18" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 7.82843C14 12.7331 7.5 16.9371 7.5 16.9371C7.5 16.9371 1 12.7331 1 7.82843C1 4.34574 3.91015 1.52246 7.5 1.52246C11.0899 1.52246 14 4.34574 14 7.82843V7.82843Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.50016 9.93054C8.69678 9.93054 9.66683 8.98945 9.66683 7.82855C9.66683 6.66766 8.69678 5.72656 7.50016 5.72656C6.30355 5.72656 5.3335 6.66766 5.3335 7.82855C5.3335 8.98945 6.30355 9.93054 7.50016 9.93054Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default IconPlace;
