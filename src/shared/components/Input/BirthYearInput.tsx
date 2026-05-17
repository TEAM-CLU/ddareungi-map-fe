import IconChevronDown from '@/shared/components/icons/IconChevronDown';
import IconClose from '@/shared/components/icons/IconClose';

import { tw } from '@/shared/libs/tw-helper';
import { yearList } from '@/shared/model/shared.data';
import { useState } from 'react';
import { View } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

interface BirthYearInputProps {
  year: number | null;
  setYear: React.Dispatch<React.SetStateAction<number | null>>;
}

const BirthYearInput = ({
  year,
  setYear,
}: BirthYearInputProps) => {
  // 모달 open/close 상태 관리
  const [isOpenYearModal, setIsOpenYearModal] = useState<boolean>(false);

  // items 값 관리
  const [yearItems, setYearItems] = useState<ItemType<number>[]>(yearList);

  return (
    <View style={[tw('flex flex-row justify-between w-full'), { gap: 9 }]}>
      <DropDownPicker
        open={isOpenYearModal}
        setOpen={setIsOpenYearModal}
        value={year}
        setValue={setYear}
        items={yearItems}
        setItems={setYearItems}
        listMode="MODAL"
        placeholder="연도"
        placeholderStyle={tw('text-base text-on-surface-placeholder font-primary-500')}
        closeAfterSelecting={true}
        containerStyle={tw('flex-2 max-w-36 min-w-0')}
        style={tw('border border-line-default h-12 bg-transparent')}
        ArrowDownIconComponent={() => <IconChevronDown />}
        labelStyle={tw('text-base font-primary-500 text-on-surface-primary')}
        selectedItemLabelStyle={tw(
          'text-base font-primary-500 text-brand-primary',
        )}
        modalTitle="태어난 연도를 선택하세요."
        modalTitleStyle={tw(
          'text-md text-on-surface-primary my-1 font-primary-700 ',
        )}
        modalProps={{
          transparent: true,
          statusBarTranslucent: true,
          animationType: 'slide',
          presentationStyle: 'pageSheet',
        }}
        modalContentContainerStyle={tw(
          'mt-32 overflow-hidden bg-surface-primary rounded-2xl',
        )}
        listItemContainerStyle={tw('bg-surface-primary my-2')}
        selectedItemContainerStyle={tw('bg-surface-secondary')}
        listItemLabelStyle={tw(
          'text-base text-center font-primary-500 text-on-surface-primary',
        )}
        CloseIconComponent={() => <IconClose />}
        showTickIcon={false}
      />
    </View>
  );
};

export default BirthYearInput;
