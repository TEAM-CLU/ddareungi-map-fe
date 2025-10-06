import { forwardRef, useMemo } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { tw } from '@/shared/libs/tw-helper';
import { SafeAreaView } from 'react-native';

interface SlideModalProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number; // 모달 열릴 때 기본 위치 (snapPoints 배열의 인덱스)
  onClose: () => void;
}

const SlideModal = forwardRef<BottomSheetModal, SlideModalProps>(
  ({ children, snapPoints = ['50%'], initialIndex = 0, onClose }, ref) => {
    const memoSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    return (
      <BottomSheetModal
        ref={ref}
        index={initialIndex}
        snapPoints={memoSnapPoints}
        onDismiss={onClose}
        enablePanDownToClose
        enableOverDrag
        backgroundStyle={tw('bg-surface-primary rounded-t-3xl')}
        handleIndicatorStyle={[
          tw('rounded-lg self-center mt-3'),
          { backgroundColor: '#CFCCD4', width: 42, height: 5.8 },
        ]}
      >
        <BottomSheetView style={tw('flex-1 mt-4 mx-4')}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
export default SlideModal;
