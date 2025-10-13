import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { tw } from '@/shared/libs/tw-helper';

interface SlideModalProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number; // 모달 열릴 때 기본 위치 (snapPoints 배열의 인덱스)
  onClose: () => void;
  isVisible?: boolean;
}

const SlideModal = ({
  children,
  snapPoints,
  initialIndex = 0,
  onClose,
  isVisible,
}: SlideModalProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const memoSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
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
      <BottomSheetView style={tw('flex-1 mt-3 mx-5')}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};
export default SlideModal;
