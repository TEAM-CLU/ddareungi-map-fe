import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';

const styles = StyleSheet.create({
  cardContainer: {
    width: '90%',
    height: 70,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    color: '#8E8E93',
  },
});

export const toastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<any>) => (
    <View style={styles.cardContainer}>
      <View style={[styles.iconContainer, { backgroundColor: '#34C759' }]}>
        <Text style={styles.iconText}>✓</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{text1}</Text>
        <Text style={styles.messageText}>{text2}</Text>
      </View>
    </View>
  ),

  error: ({ text1, text2 }: ToastConfigParams<any>) => (
    <View style={styles.cardContainer}>
      <View style={[styles.iconContainer, { backgroundColor: '#FF3B30' }]}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{text1}</Text>
        <Text style={styles.messageText}>{text2}</Text>
      </View>
    </View>
  ),
};