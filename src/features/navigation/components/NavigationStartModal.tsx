import { IconClose } from '@/shared/components/icons';
import { tw } from '@/shared/libs/tw-helper';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface NavigationStartModalProps {
  modalRef: React.RefObject<Modal | null>;
  setShowNavigationStartModal: (show: boolean) => void;
}

const NavigationStartModal = ({
  modalRef,
  setShowNavigationStartModal,
}: NavigationStartModalProps) => {
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
          onPress={() => setShowNavigationStartModal(false)}
          style={[tw('absolute top-3 right-3')]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
            오늘도
          </Text>
          <Text
            style={[
              tw('font-primary-700 text-brand-primary'),
              { fontSize: 24 },
            ]}
          >
            안전하게
          </Text>
          <Text
            style={[
              tw('font-primary-700 text-on-surface-primary'),
              { fontSize: 24 },
            ]}
          >
            따릉이와 함께 달려요!
          </Text>
        </View>
        <Image
          source={require('@/assets/imgs/bikeIcon.png')}
          resizeMode="cover"
        />
      </View>
    </Modal>
  );
};
export default NavigationStartModal;
