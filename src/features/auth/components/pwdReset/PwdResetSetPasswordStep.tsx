import Input from '@/shared/components/Input/Input';
import { useEffect, useState } from 'react';
import { tw } from '@/shared/libs/tw-helper';
import { Alert, Text, View } from 'react-native';
import SquareButton from '@/shared/components/button/SquareButton';
import RoundButton from '@/shared/components/button/RoundButton';
import { checkPassword } from '@/features/auth/utils/checkPassword';
import { useResetPasswordMutation } from '@/features/auth/services/auth.queries';
import {
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '@/features/auth/model/auth.types';
import axios from 'axios';

interface PwdResetSetPasswordStepProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setResetPwdStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  setAccountFeatures: React.Dispatch<
    React.SetStateAction<'findAccount' | 'resetPwd' | null>
  >;
}

const PwdResetSetPasswordStep = ({
  email,
  setEmail,
  setResetPwdStep,
  setAccountFeatures,
}: PwdResetSetPasswordStepProps) => {
  const { mutateAsync: resetPwd } = useResetPasswordMutation();
  const [newPwd, setNewPwd] = useState<string>('');
  const [confirmNewPwd, setConfirmNewPwd] = useState<string>('');
  const [isValidNewPwd, setIsValidNewPwd] = useState<boolean>(true);
  const [isValidConfirmNewPwd, setIsValidConfirmNewPwd] =
    useState<boolean>(true);

  const [showConfirmNewPwdInput, setShowConfirmNewPwdInput] =
    useState<boolean>(false);

  const [newPwdErrorDescription, setNewPwdErrorDescription] =
    useState<string>('');
  const [confirmNewPwdErrorDescription, setConfirmNewPwdErrorDescription] =
    useState<string>('');
  const [newPwdSuccessDescription, setNewPwdSuccessDescription] =
    useState<string>('영어 숫자 포함 8자 이상, 특수기호 1개 이상 포함');
  const [confirmNewPwdSuccessDescription, setConfirmNewPwdSuccessDescription] =
    useState<string>('');

  const [canCompletePwdReset, setCanCompletePwdReset] =
    useState<boolean>(false);

  const [isReadyToPwdReset, setIsReadyToPwdReset] = useState(false); // 비밀번호 재설정 요청 가능 여부

  const handleValidatePwdButtonPress = () => {
    // 비밀번호 입력 검사
    if (newPwd === '') {
      setConfirmNewPwdErrorDescription('');
      setConfirmNewPwdSuccessDescription('위 비밀번호를 먼저 입력해주세요.');
      setIsValidConfirmNewPwd(true);
      setNewPwdSuccessDescription('');
      setIsValidNewPwd(false);
      setNewPwdErrorDescription('변경 할 비밀번호를 입력해주세요.');
      return;
    }

    const pwdRegex =
      /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    // 비밀번호 양식 검사 - 불일치
    if (!pwdRegex.test(newPwd)) {
      setConfirmNewPwdErrorDescription('');
      setIsValidConfirmNewPwd(true);
      setConfirmNewPwdSuccessDescription(
        '위 비밀번호를 먼저 알맞게 입력해주세요.',
      );
      setNewPwdSuccessDescription('');
      setIsValidNewPwd(false);
      setNewPwdErrorDescription(
        '영어 숫자 포함 8자 이상, 특수기호 1개 이상 포함해주세요.',
      );
      return;
    }
    // 비밀번호 양식 검사 - 일치
    if (pwdRegex.test(newPwd)) {
      setNewPwdErrorDescription('');
      setIsValidNewPwd(true);
      setNewPwdSuccessDescription('사용 가능한 비밀번호입니다.');
      setIsReadyToPwdReset(false);
      // 비밀번호 재확인 입력 검사
      if (confirmNewPwd === '') {
        setConfirmNewPwdSuccessDescription('');
        setIsValidConfirmNewPwd(false);
        setConfirmNewPwdErrorDescription('비밀번호를 다시 한번 입력해주세요.');
        return;
      }

      // 비밀번호 재확인 - 불일치
      if (confirmNewPwd !== '' && newPwd !== confirmNewPwd) {
        setConfirmNewPwdSuccessDescription('');
        setIsValidConfirmNewPwd(false);
        setConfirmNewPwdErrorDescription('비밀번호가 일치하지 않습니다.');
        setCanCompletePwdReset(false);
        return;
      }

      // 비밀번호 재확인 - 일치
      if (confirmNewPwd !== '' && newPwd === confirmNewPwd) {
        setConfirmNewPwdErrorDescription('');
        setIsValidConfirmNewPwd(true);
        setConfirmNewPwdSuccessDescription('비밀번호가 일치합니다.');
        setCanCompletePwdReset(true);
        return;
      }
    }
  };

  const handleCompletePwdResetButtonPress = async () => {
    // 이메일 양식 재확인 -> 외부에서 프롭스로 들어오는 값인기 때문에
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('이메일 형식이 올바르지 않습니다. 다시 시도해주세요.');
        setResetPwdStep(1);
        return;
      }

      const payload: ResetPasswordPayload = {
        email: email,
        newPassword: newPwd,
      };

      try {
        const response: ResetPasswordResponse = await resetPwd(payload);

        // 성공 케이스
        Alert.alert(`${response.message}`);
        setAccountFeatures(null);
        return;
      } catch (error) {
        setIsValidNewPwd(false);
        setNewPwdSuccessDescription('');
        setConfirmNewPwdSuccessDescription('');
        if (axios.isAxiosError(error)) {
          setNewPwdErrorDescription(
            `${
              error.response?.data?.message ?? '요청 실패. 다시 시도해주세요.'
            }`,
          );
        }
        return;
      }
    }
  };

  useEffect(() => {
    if (newPwd !== '') setShowConfirmNewPwdInput(true);
  }, [newPwd]);

  useEffect(() => {
    const canProceed =
      isValidNewPwd &&
      isValidConfirmNewPwd &&
      showConfirmNewPwdInput &&
      !!email &&
      !!newPwd &&
      !!confirmNewPwd &&
      newPwd === confirmNewPwd &&
      canCompletePwdReset;
    setIsReadyToPwdReset(canProceed);
  }, [
    isValidNewPwd,
    isValidConfirmNewPwd,
    showConfirmNewPwdInput,
    newPwd,
    confirmNewPwd,
    canCompletePwdReset,
  ]);

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
          새 비밀번호를
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
      <View style={[tw('flex-col w-full flex'), { gap: 14 }]}>
        <View
          style={[
            tw('flex flex-col w-full'),
            { gap: 12 },
            !showConfirmNewPwdInput && { marginBottom: 100 },
          ]}
        >
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요."
            value={newPwd}
            onChangeText={setNewPwd}
            isValid={isValidNewPwd}
          />
          <View style={tw('w-full flex flex-row items-center justify-start')}>
            <Text
              style={[
                tw('font-primary-500'),
                { fontSize: 13 },
                isValidNewPwd ? tw('text-brand-primary') : tw('text-error'),
              ]}
            >
              {isValidNewPwd
                ? newPwdSuccessDescription
                : newPwdErrorDescription}
            </Text>
          </View>
        </View>
        {showConfirmNewPwdInput && (
          <View
            style={[tw('flex flex-col w-full'), { gap: 12, marginBottom: 100 }]}
          >
            <Input
              type="password"
              placeholder="비밀번호를 다시 한번 입력하세요."
              value={confirmNewPwd}
              onChangeText={setConfirmNewPwd}
              isValid={isValidConfirmNewPwd}
            />
            <View
              style={tw('w-full flex flex-row items-center justify-between')}
            >
              <Text
                style={[
                  tw('font-primary-500'),
                  { fontSize: 13 },
                  isValidConfirmNewPwd
                    ? tw('text-brand-primary')
                    : tw('text-error'),
                ]}
              >
                {isValidConfirmNewPwd
                  ? confirmNewPwdSuccessDescription
                  : confirmNewPwdErrorDescription}
              </Text>
              <RoundButton
                title="확인하기"
                onPress={handleValidatePwdButtonPress}
                preset="sm"
              />
            </View>
          </View>
        )}
      </View>
      <RoundButton
        title="재설정 완료"
        onPress={handleCompletePwdResetButtonPress}
        preset="lg"
        disabled={!isReadyToPwdReset}
      />
    </View>
  );
};

export default PwdResetSetPasswordStep;
