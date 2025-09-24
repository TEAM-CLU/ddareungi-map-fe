import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import Input from '@/shared/components/Input';
import BackButton from '@/shared/components/BackButton';
import BirthDateInput from '@/shared/components/BirthDateInput';
import IconRun from '@/shared/components/icons/IconRun';
import IconBicycle from '@/shared/components/icons/IconBicycle';
import IconKcal from '@/shared/components/icons/IconKcal';
import IconPlus from '@/shared/components/icons/IconPlus';
import IconLocatorMark from '@/shared/components/icons/IconLocatorMark';
import IconSend from '@/shared/components/icons/IconCompass';
import IconAudio from '@/shared/components/icons/IconAudio';
import IconInfo from '@/shared/components/icons/IconInfo';
import IconCompass from '@/shared/components/icons/IconCompass';
import IconLocation from '@/shared/components/icons/IconLocation';
import IconTree from '@/shared/components/icons/IconTree';
import IconMyPage from '@/shared/components/icons/IconMyPage';
import IconRecommendedPath from '@/shared/components/icons/IconRecommendedPath';
import IconDirections from '@/shared/components/icons/IconDirections';
import IconHamburger from '@/shared/components/icons/IconHamburger';
import IconMute from '@/shared/components/icons/IconMute';
import IconRefresh from '@/shared/components/icons/IconRefresh';
import IconPlay from '@/shared/components/icons/IconPlay';
import IconBikeMarker from '@/shared/components/icons/IconBikeMarker';
import IconSpotMarker from '@/shared/components/icons/IconSpotMarker';
import IconMinus from '@/shared/components/icons/IconMinus';
import IconUserDirection from '@/shared/components/icons/IconUserDirection';
import IconVolume from '@/shared/components/icons/IconVolumne';
import IconEclipse from '@/shared/components/icons/IconEclipse';
import IconSwitch from '@/shared/components/icons/IconSwitch';
import IconPause from '@/shared/components/icons/IconPause';
import IconRouteMarker from '@/shared/components/icons/IconRouteMarker';

const TestScreen = () => {
  const [inputValue, setInputValue] = useState<string>();
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);

  return (
    <View
      style={[
        tw('flex-1 items-center justify-center flex flex-col'),
        { gap: 10 },
      ]}
    >
      <Input
        type={'number'}
        placeholder="hello"
        value={inputValue}
        onChangeText={setInputValue}
        isValid={true}
      />
      <BackButton type={'previous'} iconColor="gray"></BackButton>
      <BirthDateInput
        year={year}
        month={month}
        day={day}
        setYear={setYear}
        setMonth={setMonth}
        setDay={setDay}
      />
      <IconTree color="#01DA86" width={30} height={30} />
      <IconRouteMarker type="destination" />
      <IconPlay />
      <IconRefresh color="#01DA86" />
      <IconMute width={28} height={28} />
      <IconRecommendedPath width={40} height={40} color="#01DA86" />
      <IconDirections color="#01DA86" />
      <IconHamburger color="black" width={28} height={28} />
      <IconMyPage color="#01DA86" />
      <IconTree color="#01DA86" width={40} height={40} />
      <IconLocation color="#01DA86" />
      <IconInfo color="#01DA86" />
      <IconAudio color="#01DA86" />
      <IconCompass color="#01DA86" />
      <IconPlus color="#01DA86" width={18} height={18} strokeWidth={0.4} />
      <IconLocatorMark color="#01DA86" width={50} height={50} />
      <IconRun color="black" width={20} height={20} />
      <IconBicycle color="black" width={20} height={20} />
      <IconKcal color="black" width={20} height={20} />
    </View>
  );
};

export default TestScreen;
