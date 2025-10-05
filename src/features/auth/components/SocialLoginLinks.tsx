import { TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import IconGoogle from '@/shared/components/icons/IconGoogle';
import IconKakao from '@/shared/components/icons/IconKakao';
import IconNaver from '@/shared/components/icons/IconNaver';

const SocialLoginLinks = () => {
  return (
    <View
      style={[
        tw('flex flex-row justify-center items-center flex-nowrap w-full'),
        { gap: 15, maxWidth: 230 },
      ]}
    >
      <TouchableOpacity
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
    </View>
  );
};

export default SocialLoginLinks;
