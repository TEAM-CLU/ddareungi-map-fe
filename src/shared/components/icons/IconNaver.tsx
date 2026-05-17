import * as React from 'react';
import { SvgProps } from 'react-native-svg';
import NaverSvg from '@/assets/svgs/naver.svg';

interface IconNaverProps extends SvgProps {
  size?: number;
}

const IconNaver = ({ size = 25, ...rest }: IconNaverProps) => {
  return <NaverSvg width={size} height={size} {...rest} />;
};

export default IconNaver;
