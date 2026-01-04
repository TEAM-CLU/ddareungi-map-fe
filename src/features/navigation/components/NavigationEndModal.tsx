import { IconClose } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { Image, ImageStyle, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface NavigationEndModalProps {
  modalRef: React.RefObject<Modal | null>;
  setShowNavigationEndModal: (show: boolean) => void;
}

const NavigationEndModal = ({
  modalRef,
  setShowNavigationEndModal,
}: NavigationEndModalProps) => {
  return (
    <Modal
      ref={modalRef}
      isVisible={true}
      backdropOpacity={0.3}
      animationIn={'fadeInUp'}
      animationOut={'fadeOutDown'}
      useNativeDriver={true}
      style={tw('justify-center items-center flex')}
    >
      <View
        style={[
          tw(
            'relative w-full flex flex-col items-start justify-between px-6 border border-brand-primary shadow-md rounded-xl bg-surface-primary',
          ),
          { gap: 50, maxWidth: 273, paddingVertical: 45 },
        ]}
      >
        <TouchableOpacity
          onPress={() => setShowNavigationEndModal(false)}
          style={[tw('absolute top-3 right-3')]}
        >
          <IconClose color="#01DA86" />
        </TouchableOpacity>
        <View
          style={[tw('flex flex-col items-start justify-center'), { gap: 8 }]}
        >
          <Text
            style={[
              tw('font-primary-700 text-on-surface-primary'),
              { fontSize: 24 },
            ]}
          >
            {'드디어\u00A0'}
            <Text
              style={[
                tw('font-primary-700 text-brand-primary'),
                { fontSize: 24 },
              ]}
            >
              목적지
            </Text>
            에
          </Text>
          <Text
            style={[
              tw('font-primary-700 text-on-surface-primary'),
              { fontSize: 24 },
            ]}
          >
            도착했어요!
          </Text>
        </View>
        <View
          style={[tw('flex flex-col items-start justify-start'), { gap: 6 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 16 },
            ]}
          >
            따릉이를 탄 시간 15분
          </Text>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 16 },
            ]}
          >
            소요시간 23분
          </Text>
          <Text
            style={[
              tw('font-primary-600 text-on-surface-primary'),
              { fontSize: 16 },
            ]}
          >
            소모 칼로리 387kcal
          </Text>
        </View>
        <Text
          style={[tw('font-primary-600 text-brand-primary'), { fontSize: 20 }]}
        >
          총 1.7km 이동했어요!
        </Text>
        <Image
          source={require('@/assets/imgs/finishFlag.png')}
          style={
            {
              position: 'absolute',
              left: 110,
              bottom: 17,
              zIndex: -1,
            } as ImageStyle
          }
          resizeMode="cover"
        />
      </View>
    </Modal>
  );
};
export default NavigationEndModal;
