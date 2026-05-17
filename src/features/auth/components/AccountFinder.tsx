import { useAccountFind } from '@/features/auth/hooks/useAccountFind';
import { AccountFeatureType } from '@/features/auth/model/common.types';
import {
  useFindAccountMutation,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
} from '@/features/auth/services/auth.queries';
import RoundButton from '@/shared/components/button/RoundButton';
import SquareButton from '@/shared/components/button/SquareButton';
import { IconClose } from '@/shared/components/icons';
import Input from '@/shared/components/Input/Input';
import { tw } from '@/shared/libs/tw-helper';
import {
  TouchableOpacity,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountFinderProps {
  setAccountFeatures: React.Dispatch<React.SetStateAction<AccountFeatureType>>;
}

const AccountFinder = ({ setAccountFeatures }: AccountFinderProps) => {
  const { mutate: sendVerificationCode } = useSendVerificationEmailMutation();
  const { mutate: verifyCode } = useVerifyEmailMutation();
  const { mutate: findAccount } = useFindAccountMutation();

  const {
    email,
    setEmail,
    code,
    setCode,
    isValidEmail,
    isValidCode,
    canShowRegistrationInfo,
    showCodeInput,
    emailErrorDescription,
    codeErrorDescription,
    emailSuccessDescription,
    codeSuccessDescription,
    showRegistrationInfo,
    registrationInfoMessage,
    accountType,
    handleClosePress,
    handleSendCodePress,
    handleVerifyCodePress,
    handleQueryRegistrationInfoPress,
  } = useAccountFind({
    sendVerificationCode,
    verifyCode,
    findAccount,
    setAccountFeatures,
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={tw('w-full flex-1 relative')}>
        <TouchableOpacity
          onPress={handleClosePress}
          style={tw('absolute top-20 right-4')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                  onPress={handleSendCodePress}
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
                    onPress={handleVerifyCodePress}
                    preset="sm"
                  />
                </View>
              </View>
            )}
          </View>
          <SquareButton
            title="다음"
            onPress={() => handleQueryRegistrationInfoPress()}
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
