import IconChevronDown from '@/shared/components/icons/IconChevronDown';
import IconClose from '@/shared/components/icons/IconClose';

import { tw } from '@/shared/libs/tw-helper';
import { monthList, yearList } from '@/shared/model/shared.data';
import { createDayListInMonth } from '@/shared/utils/date';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

interface BirthDateInputProps {
  year: number | null;
  month: number | null;
  day: number | null;
  setYear: React.Dispatch<React.SetStateAction<number | null>>;
  setMonth: React.Dispatch<React.SetStateAction<number | null>>;
  setDay: React.Dispatch<React.SetStateAction<number | null>>;
}

const BirthDateInput = ({
  year,
  month,
  day,
  setYear,
  setMonth,
  setDay,
}: BirthDateInputProps) => {
  // 모달 open/close 상태 관리
  const [isOpenYearModal, setIsOpenYearModal] = useState<boolean>(false);
  const [isOpenMonthModal, setIsOpenMonthModal] = useState<boolean>(false);
  const [isOpenDayModal, setIsOpenDayModal] = useState<boolean>(false);

  // items 값 관리 (day와 달리 바뀌진 않지만, 일관성 있게 상태값으로 관리)
  const [yearItems, setYearItems] = useState<ItemType<number>[]>(yearList);
  const [monthItems, setMonthItems] = useState<ItemType<number>[]>(monthList);

  // year, month에 따라 동적으로 바뀌는 dayItems 상태값 세팅
  const dayList = useMemo(
    () => createDayListInMonth(year, month),
    [year, month],
  );
  const [dayItems, setDayItems] = useState<ItemType<number>[]>(dayList);

  useEffect(() => setDayItems(dayList), [dayList]);

  return (
    <View style={[tw('flex flex-row  justify-between w-full'), { gap: 9 }]}>
      <DropDownPicker
        open={isOpenYearModal}
        setOpen={setIsOpenYearModal}
        onOpen={() => {
          setIsOpenMonthModal(false);
          setIsOpenDayModal(false);
        }}
        value={year}
        setValue={setYear}
        items={yearItems}
        setItems={setYearItems}
        listMode="MODAL"
        placeholder="연도"
        placeholderStyle={tw('text-base text-placeholder font-primary-500 ')}
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
      <DropDownPicker
        open={isOpenMonthModal}
        setOpen={setIsOpenMonthModal}
        onOpen={() => {
          setIsOpenYearModal(false);
          setIsOpenDayModal(false);
        }}
        value={month}
        setValue={setMonth}
        items={monthItems}
        setItems={setMonthItems}
        listMode="MODAL"
        placeholder="월"
        placeholderStyle={tw('text-base text-placeholder font-primary-500 ')}
        closeAfterSelecting
        containerStyle={tw('flex-1 min-w-0')}
        style={tw('border border-line-default h-12 bg-transparent')}
        ArrowDownIconComponent={() => <IconChevronDown />}
        labelStyle={tw('text-base font-primary-500 text-on-surface-primary')}
        selectedItemLabelStyle={tw(
          'text-base font-primary-500 text-brand-primary',
        )}
        modalTitle="태어난 달을 선택하세요."
        modalTitleStyle={tw(
          'text-md text-on-surface-primary my-1 font-primary-700',
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
      <DropDownPicker
        open={isOpenDayModal}
        setOpen={setIsOpenDayModal}
        onOpen={() => {
          setIsOpenYearModal(false);
          setIsOpenMonthModal(false);
        }}
        value={day}
        setValue={setDay}
        items={dayItems}
        setItems={setDayItems}
        listMode="MODAL"
        placeholder="일"
        placeholderStyle={tw('text-base  font-primary-500 text-placeholder')}
        closeAfterSelecting
        containerStyle={tw('flex-1 min-w-0')}
        style={tw('border border-line-default h-12 bg-transparent')}
        ArrowDownIconComponent={() => <IconChevronDown />}
        labelStyle={tw('text-base font-primary-500 text-on-surface-primary')}
        selectedItemLabelStyle={tw(
          'text-base font-primary-500 text-brand-primary',
        )}
        modalTitle="태어난 날을 선택하세요."
        modalTitleStyle={tw(
          'text-md text-on-surface-primary my-1 font-primary-700',
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

export default BirthDateInput;
