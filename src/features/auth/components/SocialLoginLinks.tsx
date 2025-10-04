import { Alert, Modal, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconGoogle from '@/shared/components/icons/IconGoogle';
import IconKakao from '@/shared/components/icons/IconKakao';
import IconNaver from '@/shared/components/icons/IconNaver';
import { SocialAuthType } from '@/features/auth/model/auth.types';
import { useRef, useState } from 'react';
import WebView, {
  WebViewNavigation,
  WebViewMessageEvent,
} from 'react-native-webview';
import { SERVER_URL } from '@/shared/model/index.constants';
import { useAuth } from '@/app/providers';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/app/types';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SocialLoginLinksProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocialLoginLinks = ({ setIsLoading }: SocialLoginLinksProps) => {
  const { setToken } = useAuth();
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const webViewRef = useRef<WebView>(null);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSocialLoginButtonPress = async (
    socialAuthType: SocialAuthType,
  ) => {
    // WebView 열기
    setAuthUrl(`${SERVER_URL}/auth/${socialAuthType}`);
    setWebViewVisible(true);
  };

  const handleWebViewNavigationStateChange = (navState: WebViewNavigation) => {
    // URL이 callback 페이지(JSON 응답)가 되었을 때
    if (navState.url.includes('/callback')) {
      // WebView에서 JavaScript로 응답 읽기
      webViewRef.current?.injectJavaScript(`
        window.ReactNativeWebView.postMessage(document.body.innerText);
      `);
    }
  };

  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // 성공: { accessToken }
      if (data.accessToken) {
        // 토큰 저장 (AuthProvider 사용)
        await setToken(data.accessToken);

        // WebView 닫기
        setWebViewVisible(false);
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
        navigation.navigate('Map');
      }
      // 실패: { statusCode, message }
      if (data.statusCode && data.message) {
        setWebViewVisible(false);
        Alert.alert('로그인 실패', data.message);
      }
    } catch (_) {
      setWebViewVisible(false);
      Alert.alert('오류', '로그인 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <View
      style={[
        tw('flex flex-row justify-center items-center flex-nowrap w-full'),
        { gap: 15, maxWidth: 230 },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleSocialLoginButtonPress('kakao')}
        style={[
          tw(
            'flex justify-center items-center rounded-full bg-surface-primary border',
          ),
          {
            backgroundColor: '#FBE300',
            width: 47,
            height: 47,
            borderColor: '#FBE300',
          },
        ]}
      >
        <IconKakao size={32} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSocialLoginButtonPress('google')}
        style={[
          tw(
            'flex justify-center items-center rounded-full bg-surface-primary border-line-default border',
          ),
          { width: 47, height: 47 },
        ]}
      >
        <IconGoogle />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSocialLoginButtonPress('naver')}
        style={[
          tw(
            'flex justify-center items-center rounded-full bg-surface-primary  border',
          ),
          {
            backgroundColor: '#03C75A',
            width: 47,
            height: 47,
            borderColor: '#03C75A',
          },
        ]}
      >
        <IconNaver size={45} />
      </TouchableOpacity>
      <Modal visible={webViewVisible} animationType="slide">
        <SafeAreaView>
          <WebView
            ref={webViewRef}
            source={{ uri: authUrl }}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
            onNavigationStateChange={handleWebViewNavigationStateChange}
            onMessage={handleWebViewMessage}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default SocialLoginLinks;
