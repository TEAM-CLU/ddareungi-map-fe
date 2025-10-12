import { RootStackParamList } from '@/app/types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { tw } from '../libs/tw-helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FOOTER_MENU } from '../model/index.constants';

const Footer = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
            if (item.name === 'station') {
              // TODO: 대여소 모달 띄우는 조건문 필요
            }

            // TODO: 경로추천도 모달 띄우는 조건문 필요

            navigation.navigate(item.screen);
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
