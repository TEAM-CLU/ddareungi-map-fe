// GoogleGIcon.tsx
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconGoogleProps {
  size?: number;
}

const IconGoogle = ({ size = 25 }: IconGoogleProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 262">
      {/* Blue */}
      <Path
        fill="#4285F4"
        d="M255.68 131.14c0-8.65-.78-17.02-2.24-25.11H130.5v47.52h70.09c-3.03 16.36-12.2 30.23-26.01 39.53v32.86h42.05c24.6-22.66 38.65-56.06 38.65-94.8z"
      />
      {/* Green */}
      <Path
        fill="#34A853"
        d="M130.5 261.1c35.13 0 64.64-11.63 86.19-31.16l-42.05-32.86c-11.74 7.89-26.8 12.58-44.14 12.58-33.92 0-62.69-22.81-72.95-53.57H14.63v33.64c21.38 42.45 65.3 71.37 115.87 71.37z"
      />
      {/* Yellow */}
      <Path
        fill="#FBBC05"
        d="M57.55 156.09c-2.74-8.19-4.3-16.92-4.3-25.94s1.56-17.75 4.3-25.94V70.57H14.63C5.25 88.9 0 109.36 0 130.15s5.25 41.25 14.63 59.58l42.92-33.64z"
      />
      {/* Red */}
      <Path
        fill="#EA4335"
        d="M130.5 51.56c19.1 0 36.29 6.58 49.86 19.47l37.4-36.98C195.11 13.51 165.6 0 130.5 0 79.93 0 36.01 28.92 14.63 71.37l42.92 33.84c10.26-30.76 39.03-53.65 72.95-53.65z"
      />
    </Svg>
  );
};

export default IconGoogle;
