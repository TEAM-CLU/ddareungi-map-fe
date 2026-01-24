import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '../libs/tw-helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FOOTER_MENU } from '../model/shared.constants';
import { useAppNavigation } from '../hooks/useAppNavigation';

interface FooterProps {
  setIsStationBtnPressed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRouteRecommendBtnPressed: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBookmarkBtnPressed: React.Dispatch<React.SetStateAction<boolean>>;
}
const Footer = ({
  setIsStationBtnPressed,
  setIsRouteRecommendBtnPressed,
  setIsBookmarkBtnPressed,
}: FooterProps) => {
  const insets = useSafeAreaInsets();
  const { navigation } = useAppNavigation();

  return (
    <View
      style={[
        tw('flex-row bg-brand-primary items-center justify-center px-1'),
        { height: 40 + insets.bottom },
      ]}
    >
      {FOOTER_MENU.map(item => (
        <TouchableOpacity
          key={item.name}
          style={[tw('flex-1 flex-col items-center justify-center mb-1')]}
          onPress={() => {
            if (item.name === 'mypage') {
              navigation.navigate(item.screen);
            }

            if (item.name === 'station') {
              setIsStationBtnPressed(true);
              return;
            }

            if (item.name === 'routeRecommend') {
              setIsRouteRecommendBtnPressed(true);
              return;
            }

            if (item.name === 'bookmark') {
              setIsBookmarkBtnPressed(true);
            }
          }}
        >
          <View style={[tw('w-6 h-6 justify-center items-center')]}>
            {item.icon}
          </View>

          <Text
            style={[
              tw('text-center text-on-surface-secondary font-primary-700 mt-1'),
              { fontSize: 13 },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
export default Footer;
