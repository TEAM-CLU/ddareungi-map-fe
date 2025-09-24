import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconAudioProps {
  color?: string;
  width?: number;
  height?: number;
}

const IconAudio = ({
  color = '#01DA86',
  width = 24,
  height = 24,
}: IconAudioProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 10.125C2.42893 10.125 0.75 11.8039 0.75 13.875V19.5C0.75 21.5711 2.42893 23.25 4.5 23.25H5.125C7.19607 23.25 8.875 21.5711 8.875 19.5V13.875C8.875 11.8039 7.19607 10.125 5.125 10.125H4.5Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.875 10.125C16.8039 10.125 15.125 11.8039 15.125 13.875V19.5C15.125 21.5711 16.8039 23.25 18.875 23.25H19.5C21.5711 23.25 23.25 21.5711 23.25 19.5L23.25 13.875C23.25 11.8039 21.5711 10.125 19.5 10.125H18.875Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.75 3.25C6.60787 3.25 3.25 6.60786 3.25 10.75V16.375H0.75V10.75C0.75 5.22715 5.22716 0.749997 10.75 0.75L13.25 0.750001C18.7729 0.750005 23.25 5.22716 23.25 10.75V16.375H20.75V10.75C20.75 6.60787 17.3921 3.25 13.25 3.25L10.75 3.25Z"
        fill={color}
      />
    </Svg>
  );
};

export default React.memo(IconAudio);
