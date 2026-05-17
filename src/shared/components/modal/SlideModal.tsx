import { forwardRef, useMemo } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { tw } from '@/shared/libs/tw-helper';
import { View } from 'react-native';

interface SlideModalProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number; // 모달 열릴 때 기본 위치 (snapPoints 배열의 인덱스)
  onDismiss: () => void;
  enablePanDownToClose?: boolean;
  enableContentPanningGesture?: boolean;
  enableHandlePanningGesture?: boolean;
  enableOverDrag?: boolean;
  useFlexView?: boolean; // 키보드 입력 있는 모달인지 여부 (true면) View(flex), false면 BottomSheetView(auto) 사용
}

const SlideModal = forwardRef<BottomSheetModal, SlideModalProps>(
  (
    {
      children,
      snapPoints,
      initialIndex = 0,
      onDismiss,
      enablePanDownToClose = true,
      enableContentPanningGesture = true,
      enableHandlePanningGesture = true,
      enableOverDrag = true,
      useFlexView = false,
    },
    ref,
  ) => {
    const memoSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    return (
      <BottomSheetModal
        ref={ref}
        index={initialIndex}
        snapPoints={memoSnapPoints}
        onDismiss={onDismiss}
        enablePanDownToClose={enablePanDownToClose}
        enableOverDrag={enableOverDrag}
        enableContentPanningGesture={enableContentPanningGesture}
        enableHandlePanningGesture={enableHandlePanningGesture}
        backgroundStyle={tw('bg-surface-primary rounded-3xl')}
        handleIndicatorStyle={[
          tw('rounded-lg  mt-3'),
          {
            backgroundColor: '#CFCCD4',
            width: 42,
            height: 5.8,
            alignSelf: 'center',
          },
        ]}
        // 키보드가 올라올 때 시트 동작 설정
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        {useFlexView ? (
          // 키보드 입력용: 단순 View 사용 (가림 현상 해결)
          // flex: 1을 줘서 스냅 포인트 높이만큼 꽉 채움
          <View style={tw('flex-1')}>{children}</View>
        ) : (
          // 일반 알림용: BottomSheetView 사용 (높이 자동 계산)
          <BottomSheetView style={tw('flex-1 mt-3 mx-5')}>
            {children}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);
export default SlideModal;
