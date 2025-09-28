import Input from '@/shared/components/Input/Input';
import { SetStateAction, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';

import { Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';
import BirthDateInput from '@/shared/components/Input/BirthDateInput';

interface SignUpProfileStepProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  birthDate: string;
  setBirthDate: React.Dispatch<React.SetStateAction<string>>;
  gender: 'male' | 'female';
  setGender: React.Dispatch<
    React.SetStateAction<'male' | 'femail' | undefined>
  >;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setSignUpStep: React.Dispatch<
    React.SetStateAction<'email' | 'password' | 'profile'>
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
  const [isValidName, setIsValidName] = useState<boolean>(true);
  const [isValidGender, setIsValidGender] = useState<boolean>(true);
  const [isValidBirthDate, setIsValidBirthDate] = useState<boolean>(true);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true);

  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);

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
        style={[tw('flex flex-col w-full'), { gap: 12, marginBottom: 100 }]}
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
      </View>

      <SquareButton
        title="다음"
        onPress={() => setSignUpStep('password')}
        // disabled={!isValidEmail}
      />
    </View>
  );
};

export default SignUpProfileStep;
