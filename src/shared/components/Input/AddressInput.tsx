import IconChevronDown from '@/shared/components/icons/IconChevronDown';
import IconClose from '@/shared/components/icons/IconClose';
import { tw } from '@/shared/libs/tw-helper';
import { dongMap, guList } from '@/shared/model/shared.data';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

interface AddressInputProps {
  gu: string | null;
  dong: string | null;
  setGu: React.Dispatch<React.SetStateAction<string | null>>;
  setDong: React.Dispatch<React.SetStateAction<string | null>>;
}

const AddressInput = ({ gu, dong, setGu, setDong }: AddressInputProps) => {
  const [isOpenGuModal, setIsOpenGuModal] = useState(false);
  const [isOpenDongModal, setIsOpenDongModal] = useState(false);

  // 자치구 리스트
  const [guItems, setGuItems] = useState<ItemType<string>[]>(guList);

  // 선택된 구에 따라 행정동 리스트 결정
  const dongList = useMemo(() => (gu ? dongMap[gu] ?? [] : []), [gu]);
  const [dongItems, setDongItems] = useState<ItemType<string>[]>(dongList);

  // 구가 바뀌면 동 리스트 갱신 + 기존 선택값 초기화
  useEffect(() => {
    setDongItems(dongList);
    setDong(null);
  }, [dongList, setDong]);

  return (
    <View
      style={[
        tw('flex flex-row justify-between w-full items-center'),
        { gap: 9 },
      ]}
    >
      <Text
        style={[tw('font-primary-600 text-brand-primary'), { fontSize: 15 }]}
      >
        서울특별시
      </Text>
      <DropDownPicker
        open={isOpenGuModal}
        setOpen={setIsOpenGuModal}
        onOpen={() => setIsOpenDongModal(false)}
        value={gu}
        setValue={setGu}
        items={guItems}
        setItems={setGuItems}
        listMode="MODAL"
        placeholder="자치구"
        placeholderStyle={tw('text-base text-placeholder font-primary-500')}
        closeAfterSelecting={true}
        containerStyle={tw('flex-1 min-w-0')}
        style={tw('border border-line-default h-12 bg-transparent')}
        ArrowDownIconComponent={() => <IconChevronDown />}
        labelStyle={tw('text-base font-primary-500 text-on-surface-primary')}
        selectedItemLabelStyle={tw(
          'text-base font-primary-500 text-brand-primary',
        )}
        modalTitle="자치구를 선택하세요."
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

      {/* 행정동 */}
      <DropDownPicker
        open={isOpenDongModal}
        setOpen={setIsOpenDongModal}
        onOpen={() => setIsOpenGuModal(false)}
        value={dong}
        setValue={setDong}
        items={dongItems}
        setItems={setDongItems}
        listMode="MODAL"
        placeholder="행정동"
        placeholderStyle={tw('text-base text-placeholder font-primary-500')}
        closeAfterSelecting={true}
        disabled={!gu}
        containerStyle={tw('flex-1 min-w-0')}
        style={tw('border border-line-default h-12 bg-transparent')}
        ArrowDownIconComponent={() => <IconChevronDown />}
        labelStyle={tw('text-base font-primary-500 text-on-surface-primary')}
        selectedItemLabelStyle={tw(
          'text-base font-primary-500 text-brand-primary',
        )}
        modalTitle="행정동을 선택하세요."
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

export default AddressInput;
