import Input from '@/shared/components/Input/Input';
import { useMemo, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';
import { Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import BirthYearInput from '@/shared/components/Input/BirthYearInput';
import GenderButton from '@/shared/components/button/GenderButton';
import { formatBirthYear } from '@/shared/utils/date';
import AddressInput from '@/shared/components/Input/AddressInput';
import { formatAddress } from '@/shared/utils/formatAddress';

interface SignUpProfileStepProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setBirthYear: React.Dispatch<React.SetStateAction<string>>;
  gender: 'M' | 'F' | undefined;
  setGender: React.Dispatch<React.SetStateAction<'M' | 'F' | undefined>>;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;
  setSignUpStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  isConsentOptionalAgreed: boolean;
}
const SignUpProfileStep = ({
  name,
  setName,
  setBirthYear,
  gender,
  setGender,
  setAddress,
  setSignUpStep,
  isConsentOptionalAgreed,
}: SignUpProfileStepProps) => {
  const [year, setYear] = useState<number | null>(null);
  const [gu, setGu] = useState<string | null>(null);
  const [dong, setDong] = useState<string | null>(null);
  const formattedBirthYear = useMemo(
    () => (year !== null ? formatBirthYear(year) : ''),
    [year],
  );
  const formattedAddress = useMemo(() => {
    if (gu && dong) return formatAddress(gu, dong);
    return '';
  }, [gu, dong]);

  // 단순히 값만 입력하면 될 경우 상태보단 이런식이 더 최적화된 방향
  const isValidName = name.trim().length > 0 && name.trim() !== ''; // isValie* 상태로 선언안해도 값이 변하는 이유: 상태값으로 할당하기 때문에 상태가변하면 리렌더링됨
  const isValidOptional =
    !isConsentOptionalAgreed ||
    ((gender === 'M' || gender === 'F') &&
      !!formattedBirthYear &&
      !!formattedAddress);
  const isFormReady = isValidName && isValidOptional;

  const handleJumpToNextStepPress = () => {
    if (!isFormReady) return;
    setBirthYear(isConsentOptionalAgreed ? formattedBirthYear : '');
    setAddress(isConsentOptionalAgreed ? formattedAddress : null);
    setSignUpStep(4);
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
            닉네임
          </Text>
          <Input
            type="text"
            placeholder="닉네임을 입력하세요."
            value={name}
            onChangeText={setName}
            isValid={isValidName}
          />
        </View>
        {isConsentOptionalAgreed && (
          <>
            <View style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}>
              <Text
                style={[
                  tw('font-primary-600 text-on-surface-label-input text-left'),
                  { fontSize: 15 },
                ]}
              >
                태어난 연도 (선택)
              </Text>
              <BirthYearInput
                year={year}
                setYear={setYear}
              />
            </View>
            <View style={[tw('flex flex-col w-full justify-center'), { gap: 10 }]}>
              <Text
                style={[
                  tw('font-primary-600 text-on-surface-label-input text-left'),
                  { fontSize: 15 },
                ]}
              >
                성별 (선택)
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
                거주지 (선택)
              </Text>
              <View
                style={[
                  tw('flex flex-row flex-nowrap items-center justify-start'),
                  { gap: 9 },
                ]}
              >
                <AddressInput
                  gu={gu}
                  setGu={setGu}
                  dong={dong}
                  setDong={setDong}
                />
              </View>
            </View>
          </>
        )}
      </View>

      <SquareButton
        title="다음"
        onPress={handleJumpToNextStepPress}
        disabled={!isFormReady}
      />
    </View>
  );
};

export default SignUpProfileStep;
