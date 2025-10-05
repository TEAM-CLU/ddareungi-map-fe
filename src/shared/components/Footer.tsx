import { RootStackParamList } from '@/app/types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import IconBicycle from './icons/IconBicycle';
import React from 'react';
import IconDirections from './icons/IconDirections';
import IconRecommendedPath from './icons/IconRecommendedPath';
import IconMyPage from './icons/IconMyPage';
import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '../libs/tw-helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FooterRoutes = keyof RootStackParamList;
const FOOTER_MENU: { name: FooterRoutes; label: string; icon: JSX.Element }[] =
  [
    { name: 'Map', label: '대여소', icon: <IconBicycle /> },
    {
      name: 'RouteSelect',
      label: '길찾기',
      icon: <IconDirections />,
    },
    {
      name: 'RouteRecommend',
      label: '추천 경로',
      icon: <IconRecommendedPath />,
    },
    {
      name: 'MyPage',
      label: '마이 페이지',
      icon: <IconMyPage />,
    },
  ];

const Footer = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View
      style={[
        tw('flex-row bg-brand-primary items-center justify-center px-1'),
        { height: 55 + insets.bottom },
      ]}
    >
      {FOOTER_MENU.map(item => (
        <TouchableOpacity
          key={item.name}
          style={[tw('flex-1 flex-col items-center justify-center mb-1')]}
          onPress={() => navigation.navigate(item.name)}
        >
          <View
            style={[
              tw('w-8 h-8 justify-center items-center'),
            ]}
          >
            {item.icon}
          </View>

          <Text
            style={tw(
              'text-center text-on-surface-secondary font-primary-700 mt-1',
            )}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
export default Footer;
