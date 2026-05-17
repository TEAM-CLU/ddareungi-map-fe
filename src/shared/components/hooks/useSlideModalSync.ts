import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject, useEffect } from 'react';

export const useSlideModalSync = (
  ref: RefObject<BottomSheetModal | null>,
  isVisible: boolean,
) => {
  useEffect(() => {
    if (isVisible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [isVisible, ref]);
};
