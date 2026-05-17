import React from 'react';
import { View, Text } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';
import { tw } from '@/shared/libs/tw-helper';

export const toastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<any>) => (
    <View
      style={[
        tw('bg-white rounded-xl flex-row items-center'),
        {
          width: '90%',
          height: 70,
          paddingHorizontal: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
      ]}
    >
      <View
        style={[
          tw('w-9 h-9 rounded-full justify-center items-center mr-3'),
          { backgroundColor: '#34C759' },
        ]}
      >
        <Text style={tw('text-white text-lg font-primary-700')}>✓</Text>
      </View>
      <View style={tw('flex-1 justify-center')}>
        <Text
          style={[tw('font-primary-600 mb-0.5'), { fontSize: 15, color: '#1C1C1E' }]}
        >
          {text1}
        </Text>
        <Text style={[tw('font-primary-400'), { fontSize: 13, color: '#8E8E93' }]}>
          {text2}
        </Text>
      </View>
    </View>
  ),

  error: ({ text1, text2 }: ToastConfigParams<any>) => (
    <View
      style={[
        tw('bg-white rounded-xl flex-row items-center'),
        {
          width: '90%',
          height: 70,
          paddingHorizontal: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
      ]}
    >
      <View
        style={[
          tw('w-9 h-9 rounded-full justify-center items-center mr-3'),
          { backgroundColor: '#FF3B30' },
        ]}
      >
        <Text style={tw('text-white text-lg font-primary-700')}>!</Text>
      </View>
      <View style={tw('flex-1 justify-center')}>
        <Text
          style={[tw('font-primary-600 mb-0.5'), { fontSize: 15, color: '#1C1C1E' }]}
        >
          {text1}
        </Text>
        <Text style={[tw('font-primary-400'), { fontSize: 13, color: '#8E8E93' }]}>
          {text2}
        </Text>
      </View>
    </View>
  ),
};
