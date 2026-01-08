import NavigationStartModal from '@/features/navigation/components/NavigationStartModal';
import React, { useRef, useEffect, useState } from 'react';
import { View, Alert, Platform, Text } from 'react-native';

const TestScreenForCho = () => {
  const modalRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <NavigationStartModal
        modalRef={modalRef}
        setShowNavigationStartModal={setShowModal}
      />
    </View>
  );
};

export default TestScreenForCho;
