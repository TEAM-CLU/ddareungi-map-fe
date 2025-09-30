import Input from '@/shared/components/Input/Input';
import { SetStateAction, useEffect, useMemo, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';

import { Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';
import BirthDateInput from '@/shared/components/Input/BirthDateInput';
import GenderButton from '@/shared/components/button/GenderButton';
import AddressInput from '@/shared/components/Input/AddressInput';
import { formatBirthDate } from '@/shared/utils/date';
import { formatAddress } from '@/shared/utils/address';

interface SignUpProfileStepProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  birthDate: string;
  setBirthDate: React.Dispatch<React.SetStateAction<string>>;
  gender: 'M' | 'F' | undefined;
  setGender: React.Dispatch<React.SetStateAction<'M' | 'F' | undefined>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setSignUpStep: React.Dispatch<
    React.SetStateAction<'email' | 'password' | 'profile' | 'permission'>
  >;
}
const SignUpProfileStep = ({
  name,
  setName,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  address,
  setAddress,
  setSignUpStep,
}: SignUpProfileStepProps) => {
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);

  const [gu, setGu] = useState<string | null>(null);
  const [dong, setDong] = useState<string | null>(null);

  const formattedBirthDate = useMemo(() => {
    if (year !== null && month !== null && day !== null) {
      return formatBirthDate(year, month, day);
    }
    return '';
  }, [year, month, day]);

  const formattedAddress = useMemo(() => {
    if (gu && dong) {
      // null 검사를 안해도 되는 이유: string은 falsy한 값이기 때문에
      return formatAddress(gu, dong);
    }
    return '';
  }, [gu, dong]);

  // 단순히 값만 입력하면 될 경우 상태보단 이런식이 더 최적화된 방향
  const isValidName = name.trim().length > 0 && name.trim() !== ''; // isValie* 상태로 선언안해도 값이 변하는 이유: 상태값으로 할당하기 때문에 상태가변하면 리렌더링됨
  const isValidGender = gender === 'M' || gender === 'F';
  const isValidBirthDate = !!formattedBirthDate;
  const isValidAddress = !!formattedAddress;

  const isFormReady =
    isValidName && isValidGender && isValidBirthDate && isValidAddress;

  const handleNextStepButtonPress = () => {
    if (!isFormReady) return;
    setBirthDate(formattedBirthDate);
    setAddress(formattedAddress);
    setSignUpStep('permission');
  };

  return (
    <View
      style={[
        tw('w-full flex-1 flex flex-col justify-between items-center'),
        { marginTop: 55 },
      ]}
    >
      <View style={[tw('flex flex-col w-full'), { gap: 3 }]}>
        <Text
          style={[
            tw('font-primary-700 text-on-surface-primary text-left'),
            { fontSize: 24 },
          ]}
        >
          본인 정보를
        </Text>
        <Text
          style={[
            tw('font-primary-700 text-on-surface-primary text-left'),
            { fontSize: 24 },
          ]}
        >
          입력해주세요.
        </Text>
      </View>
      <View
        style={[tw('flex flex-col w-full'), { gap: 14, marginBottom: 100 }]}
      >
        <View style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-label-input text-left'),
              { fontSize: 15 },
            ]}
          >
            이름
          </Text>
          <Input
            type="text"
            placeholder="이름을 입력하세요."
            value={name}
            onChangeText={setName}
            isValid={isValidName}
          />
        </View>
        <View style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-label-input text-left'),
              { fontSize: 15 },
            ]}
          >
            생년월일
          </Text>
          <BirthDateInput
            year={year}
            month={month}
            day={day}
            setYear={setYear}
            setMonth={setMonth}
            setDay={setDay}
          />
        </View>
        <View style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-label-input text-left'),
              { fontSize: 15 },
            ]}
          >
            성별
          </Text>
          <View
            style={[
              tw('flex flex-row flex-nowrap items-center justify-start'),
              { gap: 9 },
            ]}
          >
            <GenderButton
              title="남성"
              onPress={() => setGender('M')}
              selected={gender === 'M'}
            />
            <GenderButton
              title="여성"
              onPress={() => setGender('F')}
              selected={gender === 'F'}
            />
          </View>
        </View>
        <View style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-label-input text-left'),
              { fontSize: 15 },
            ]}
          >
            주소
          </Text>
          <View
            style={[
              tw('flex flex-row flex-nowrap items-center justify-start'),
              { gap: 9 },
            ]}
          >
            <AddressInput gu={gu} setGu={setGu} dong={dong} setDong={setDong} />
          </View>
        </View>
      </View>

      <SquareButton
        title="다음"
        onPress={handleNextStepButtonPress}
        disabled={!isFormReady}
      />
    </View>
  );
};

export default SignUpProfileStep;
