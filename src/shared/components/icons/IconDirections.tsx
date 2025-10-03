import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconDirectionsProps {
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const IconDirections = ({
  color = 'white',
  width = 28,
  height = 28,
  strokeWidth = 2.2,
}: IconDirectionsProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 29 29" fill="none">
      <Path
        d="M10.5956 24.293L13.9274 17.0741C13.9505 17.024 13.962 16.999 13.978 16.9912C13.9919 16.9844 14.0081 16.9844 14.022 16.9912C14.038 16.999 14.0495 17.024 14.0726 17.0741L17.4044 24.293C17.4337 24.3565 17.4484 24.3883 17.4425 24.4068C17.4374 24.4228 17.4247 24.4351 17.4085 24.4397C17.3899 24.445 17.3586 24.4294 17.296 24.3981L14.0358 22.768C14.0227 22.7614 14.0161 22.7581 14.0092 22.7568C14.0031 22.7557 13.9969 22.7557 13.9908 22.7568C13.9839 22.7581 13.9773 22.7614 13.9642 22.768L10.704 24.3981C10.6414 24.4294 10.6101 24.445 10.5915 24.4397C10.5753 24.4351 10.5626 24.4228 10.5575 24.4068C10.5516 24.3883 10.5663 24.3565 10.5956 24.293Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M5.83331 19.8333L9.33331 3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M22.1667 19.8333L18.6667 3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M14 11.6666L14 9.33325"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M19.8333 19.8333H21.3C22.4201 19.8333 22.9802 19.8333 23.408 19.6153C23.7843 19.4236 24.0903 19.1176 24.282 18.7413C24.5 18.3135 24.5 17.7534 24.5 16.6333V6.7C24.5 5.57989 24.5 5.01984 24.282 4.59202C24.0903 4.21569 23.7843 3.90973 23.408 3.71799C22.9802 3.5 22.4201 3.5 21.3 3.5H6.7C5.57989 3.5 5.01984 3.5 4.59202 3.71799C4.21569 3.90973 3.90973 4.21569 3.71799 4.59202C3.5 5.01984 3.5 5.57989 3.5 6.7V16.6333C3.5 17.7534 3.5 18.3135 3.71799 18.7413C3.90973 19.1176 4.21569 19.4236 4.59202 19.6153C5.01984 19.8333 5.5799 19.8333 6.7 19.8333H8.16667"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default React.memo(IconDirections);
