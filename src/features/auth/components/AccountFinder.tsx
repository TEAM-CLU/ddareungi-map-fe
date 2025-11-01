import { RootStackParamList } from '@/app/types';
import AccountLinks from '@/features/auth/components/AccountLinks';
import {
  FindAccountResponse,
  SendVerificationEmailResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from '@/features/auth/model/auth.types';
import {
  useFindAccountMutation,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
} from '@/features/auth/services/auth.queries';
import RoundButton from '@/shared/components/button/RoundButton';
// import SocialLoginLinks from '@/features/auth/components/SocialLoginLinks';
import SquareButton from '@/shared/components/button/SquareButton';
import IconClose from '@/shared/components/icons/IconClose';
import Input from '@/shared/components/Input/Input';
import { tw } from '@/shared/libs/tw-helper';
import { NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { useRef, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountFinderProps {
  setAccountFeatures: React.Dispatch<
    React.SetStateAction<'findAccount' | 'resetPwd' | null>
  >;
}

const AccountFinder = ({ setAccountFeatures }: AccountFinderProps) => {
  const { mutateAsync: sendVerificationCode } =
    useSendVerificationEmailMutation();
  const { mutateAsync: verifyCode } = useVerifyEmailMutation();
  const { mutateAsync: findAccount } = useFindAccountMutation();

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [isValidCode, setIsValidCode] = useState<boolean>(true);
  const [canShowRegistrationInfo, setCanShowRegistrationInfo] =
    useState<boolean>(false);

  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);

  const [emailErrorDescription, setEmailErrorDescription] =
    useState<string>('');
  const [codeErrorDescription, setCodeErrorDescription] = useState<string>('');
  const [emailSuccessDescription, setEmailSuccessDescription] =
    useState<string>('');
  const [codeSuccessDescription, setCodeSuccessDescription] =
    useState<string>('');

  const securityToken = useRef<string>('');
  const [showRegistrationInfo, setShowRegistrationInfo] =
    useState<boolean>(false);
  const [registrationInfoMessage, setRegistrationInfoMessage] = useState<
    string[]
  >([]);
  const [accountType, setAccountType] = useState<'소셜' | '자체' | null>(null);

  const handleCloseButtonPress = () => setAccountFeatures(null);

  // 이메일 양식 확인 후 바로 코드 전송
  const handleSendCodeButtonPress = async () => {
    // 이메일 입력 확인
    if (email.trim() === '') {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // payload 생성
    const payload = { email: email };

    // 이메일 형식이 올바르면 코드 전송
    try {
      const response: SendVerificationEmailResponse =
        await sendVerificationCode(payload);

      // 성공 시
      Alert.alert('인증 코드가 전송되었습니다.');
      setIsValidEmail(true);
      setIsValidCode(true);
      setShowCodeInput(true);
      setEmailErrorDescription('');
      setCodeSuccessDescription(`${response.message}`);
    } catch (error) {
      // 네트워크 또는 서버 오류 처리
      setCodeSuccessDescription('');
      if (axios.isAxiosError(error)) {
        setCodeErrorDescription(
          `${error.response?.data?.message ?? '요청 실패. 다시 시도해주세요.'}`,
        );
      }
    }
  };

  const handleVerifyCodeButtonPress = async () => {
    // 이메일 입력 재확인
    if (email.trim() === '') {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('이메일을 입력해주세요.');
      return;
    } else {
      setEmailErrorDescription('');
      setIsValidEmail(true);
      setEmailSuccessDescription('');
    }

    // 이메일 형식 재확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailSuccessDescription('');
      setIsValidEmail(false);
      setEmailErrorDescription('올바른 이메일 형식이 아닙니다.');
      return;
    } else {
      setEmailErrorDescription('');
      setIsValidEmail(true);
      setEmailSuccessDescription('');
    }

    // 인증코드 입력 확인
    if (code.trim() === '') {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      setCodeErrorDescription('인증 코드를 입력해주세요.');
      return;
    }

    // 인증코드 형식 확인 (숫자만 허용)
    const codeRegex = /^\d+$/;
    if (!codeRegex.test(code)) {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      setCodeErrorDescription('숫자만 입력 가능합니다.');
      return;
    }

    // 6자리 검증
    if (code.length !== 6) {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      setCodeErrorDescription('인증 코드는 6자리여야 합니다.');
      return;
    }

    // payload 생성
    const payload: VerifyEmailPayload = {
      email: email,
      verificationCode: code,
    };

    // 인증코드 확인
    try {
      const response: VerifyEmailResponse = await verifyCode(payload);

      setCodeErrorDescription('');
      setIsValidCode(true);
      setCodeSuccessDescription(`${response.message}`);
      setCanShowRegistrationInfo(true);
      securityToken.current = response.data.securityToken;
    } catch (error) {
      setCodeSuccessDescription('');
      setIsValidCode(false);
      if (axios.isAxiosError(error)) {
        setCodeErrorDescription(
          `${error.response?.data?.message ?? '요청 실패. 다시 시도해주세요.'}`,
        );
      }
    }
  };

  const handleQueryRegistrationInfoBtnPress = async () => {
    if (!securityToken.current) {
      Alert.alert('요청 실패. 다시 시도해주세요.');
      setAccountFeatures(null);
      return;
    }

    const payload = {
      securityToken: securityToken.current,
    };

    try {
      const response: FindAccountResponse = await findAccount(payload);
      const sentences = response.message.split('.');
      setRegistrationInfoMessage(sentences);
      setAccountType(response.data.accountType);
      setShowRegistrationInfo(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert(
          `${error.response?.data?.message ?? '요청 실패. 다시 시도해주세요.'}`,
        );
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={tw('w-full flex-1')}>
        <TouchableOpacity
          onPress={handleCloseButtonPress}
          style={tw('fixed top-5 left-4')}
        >
          <IconClose />
        </TouchableOpacity>
        <View
          style={[
            tw('w-full flex-1 flex flex-col justify-between items-center'),
            { marginTop: 85, paddingHorizontal: 36 },
          ]}
        >
          <View style={[tw('flex flex-col w-full'), { gap: 3 }]}>
            <Text
              style={[
                tw('font-primary-700 text-on-surface-primary text-left'),
                { fontSize: 24 },
              ]}
            >
              가입한 이메일을
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
                !showCodeInput && { marginBottom: 100 },
              ]}
            >
              <Input
                type="text"
                placeholder="이메일을 입력하세요."
                value={email}
                onChangeText={setEmail}
                isValid={isValidEmail}
              />
              <View
                style={tw('w-full flex flex-row items-center justify-between')}
              >
                <Text
                  style={[
                    tw('font-primary-500'),
                    { fontSize: 13 },
                    isValidEmail ? tw('text-brand-primary') : tw('text-error'),
                  ]}
                >
                  {isValidEmail
                    ? emailSuccessDescription
                    : emailErrorDescription}
                </Text>
                <RoundButton
                  title={showCodeInput ? '재전송' : '코드전송'}
                  onPress={handleSendCodeButtonPress}
                  preset="sm"
                />
              </View>
            </View>
            {showCodeInput && (
              <View
                style={[
                  tw('flex flex-col w-full'),
                  { gap: 12, marginBottom: 100 },
                ]}
              >
                <Input
                  type="number"
                  placeholder="인증 코드를 입력하세요."
                  value={code}
                  onChangeText={setCode}
                  isValid={isValidCode}
                />
                <View
                  style={tw(
                    'w-full flex flex-row items-center justify-between',
                  )}
                >
                  <Text
                    style={[
                      tw('font-primary-500'),
                      { fontSize: 13 },
                      isValidCode ? tw('text-brand-primary') : tw('text-error'),
                    ]}
                  >
                    {isValidCode
                      ? codeSuccessDescription
                      : codeErrorDescription}
                  </Text>
                  <RoundButton
                    title="코드확인"
                    onPress={handleVerifyCodeButtonPress}
                    preset="sm"
                  />
                </View>
              </View>
            )}
          </View>
          <SquareButton
            title="다음"
            onPress={() => handleQueryRegistrationInfoBtnPress()}
            disabled={!canShowRegistrationInfo}
          />
        </View>
        {/* 정보 확인 모달 */}
        <Modal
          isVisible={showRegistrationInfo}
          backdropOpacity={0.5}
          animationIn={'fadeInUp'}
          animationOut={'fadeOutDown'}
          useNativeDriver={true}
          style={tw('items-center justify-center')}
        >
          <View
            style={[
              tw(
                'flex flex-col border rounded-xl w-full border-line-default p-4 bg-surface-primary justify-between',
              ),
              { gap: 30, height: 230, maxWidth: 300 },
            ]}
          >
            <View />
            <View style={[tw('flex flex-col items-center'), { gap: 8 }]}>
              {registrationInfoMessage.map((msg, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      tw('font-primary-600 text-on-surface-primary'),
                      { fontSize: 15 },
                    ]}
                  >
                    {msg}
                  </Text>
                );
              })}
              <Text
                style={[
                  tw('font-primary-500 text-on-surface-placeholder'),
                  { fontSize: 13 },
                ]}
              >{`계정 유형: ${accountType}`}</Text>
            </View>
            <RoundButton
              preset="lg"
              title="확인"
              onPress={() => setAccountFeatures(null)}
            />
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};
export default AccountFinder;
