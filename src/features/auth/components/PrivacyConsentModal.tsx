import { RootStackParamList } from '@/app/types';
import RoundButton from '@/shared/components/button/RoundButton';
import { IconClose } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import CheckBox from '@react-native-community/checkbox';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface PrivacyConsentModalProps {
  setIsPrivacyConsentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConsentRequiredAgreed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConsentOptionalAgreed: React.Dispatch<React.SetStateAction<boolean>>;
  setConsentedAt: React.Dispatch<React.SetStateAction<string | null>>;
  isPrivacyConsentModalOpen: boolean;
  isConsentRequiredAgreed: boolean;
  isConsentOptionalAgreed: boolean;
  onCancel: () => void;
}
const PrivacyConsentModal = ({
  setIsPrivacyConsentModalOpen,
  setIsConsentRequiredAgreed,
  setIsConsentOptionalAgreed,
  setConsentedAt,
  isPrivacyConsentModalOpen,
  isConsentRequiredAgreed,
  isConsentOptionalAgreed,
  onCancel,
}: PrivacyConsentModalProps) => {
  const [canProceed, setCanProceed] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleAgreeBtnPress = () => {
    if (!isConsentRequiredAgreed) {
      Alert.alert('필수항목에 동의하셔야 회원가입이 가능합니다.');
      return;
    }
    setIsPrivacyConsentModalOpen(false);
    setConsentedAt(new Date().toISOString());
  };

  const handleCancleBtnPress = () => {
    onCancel();
  };

  useEffect(() => {
    setCanProceed(isConsentRequiredAgreed);
  }, [isConsentRequiredAgreed]);

  return (
    <Modal
      isVisible={isPrivacyConsentModalOpen}
      backdropOpacity={0.5}
      animationIn={'fadeInUp'}
      animationOut={'fadeOutDown'}
      useNativeDriver={true}
    >
      <View
        style={[
          tw(
            'w-full flex flex-col items-center bg-surface-primary p-6 rounded-xl',
          ),
          { gap: 10 },
        ]}
      >
        <View style={tw('flex flex-row w-full justify-between items-center')}>
          <TouchableOpacity onPress={handleCancleBtnPress}>
            <IconClose />
          </TouchableOpacity>
          <View></View>
        </View>
        <Text
          style={[
            tw('text-center font-primary-700 text-on-surface-primary'),
            { fontSize: 24 },
          ]}
        >
          개인정보 수집 및 이용 동의
        </Text>
        <View style={tw('bg-surface-secondary rounded-xl p-3')}>
          <View
            style={[
              tw('flex flex-row items-center justify-between w-full mb-2'),
              { gap: 1 },
            ]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 18 },
              ]}
            >
              필수항목 동의
            </Text>
            <CheckBox
              value={isConsentRequiredAgreed}
              onValueChange={setIsConsentRequiredAgreed}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              disabled={isConsentRequiredAgreed}
            />
          </View>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-primary'),
              { fontSize: 14 },
            ]}
          >
            본 서비스는 회원가입 및 맞춤형 경로 추천 제공을 위해 아래 정보를
            수집·이용합니다.
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            수집 항목: 이메일(아이디), 이름, 생년월일, 성별
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            이용 목적: 회원관리 및 식별, 맞춤형 경로 추천 제공
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            보유 기간: 회원 탈퇴 시까지
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            제3자 제공 및 위탁 처리: 없음
          </Text>
        </View>
        <View style={tw('bg-surface-secondary rounded-xl p-3')}>
          <View
            style={[
              tw('flex flex-row items-center justify-between w-full mb-2'),
              { gap: 1 },
            ]}
          >
            <Text
              style={[
                tw('font-primary-600 text-on-surface-primary'),
                { fontSize: 18 },
              ]}
            >
              선택항목 동의
            </Text>
            <CheckBox
              value={isConsentOptionalAgreed}
              onValueChange={setIsConsentOptionalAgreed}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>

          <Text
            style={[
              tw('font-primary-500 text-on-surface-primary'),
              { fontSize: 14 },
            ]}
          >
            더 나은 지역 기반 추천 서비스를 위해 아래 정보를 선택적으로
            수집·이용합니다.
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            수집 항목: 거주 지역(시/군/동)
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            이용 목적: 지역 맞춤 추천 및 통계 분석
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            보유 기간: 회원 탈퇴 시까지
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            제3자 제공 및 위탁 처리: 없음
          </Text>
        </View>
        <View style={tw('bg-surface-secondary rounded-xl p-3')}>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary mb-2'),
              { fontSize: 18 },
            ]}
          >
            동의 거부 및 이용 제한 안내
          </Text>
          <Text
            style={[
              tw('font-primary-500 text-on-surface-placeholder'),
              { fontSize: 14 },
            ]}
          >
            이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.
            다만, 필수 항목에 대한 동의를 거부하시는 경우 회원가입 및 마이페이지
            등 일부 기능 이용이 제한될 수 있습니다. 선택 항목에 대한 동의를
            거부하셔도 기본적인 서비스(경로 탐색, 지도 보기 등)는 정상적으로
            이용 가능합니다.
          </Text>
        </View>
        <RoundButton
          title={'확인'}
          onPress={handleAgreeBtnPress}
          disabled={!canProceed}
          preset={'lg'}
        />
      </View>
    </Modal>
  );
};

export default PrivacyConsentModal;
