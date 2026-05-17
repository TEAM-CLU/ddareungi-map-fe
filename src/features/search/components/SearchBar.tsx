import { TouchableOpacity, View, TextInput } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import {
  IconBackArrow,
  IconClose,
  IconSearch,
} from '@/shared/components/icons';
import { useEffect, useRef } from 'react';
import { useSearchStore } from '@/features/search/stores/useSearchStore';
import { useShallow } from 'zustand/react/shallow';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onPressSearch?: () => void;
  onPressBack?: () => void;
  onPressClose?: () => void;
  onPress?: () => void;
  onFocus?: () => void;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  onPressSearch,
  onPressBack,
  onPressClose,
  onPress,
  onFocus,
  showBackButton = false,
  showCloseButton = false,
}: SearchBarProps) => {
  const {
    isFocused,
    setIsFocused,
    setSearchInputRef,
    showSearchOverlay,
    selectedPlaceInfoForModal,
  } = useSearchStore(
    useShallow(state => ({
      isFocused: state.isFocused,
      setIsFocused: state.setIsFocused,
      setSearchInputRef: state.setSearchInputRef,
      showSearchOverlay: state.showSearchOverlay,
      selectedPlaceInfoForModal: state.selectedPlaceInfoForModal,
    })),
  );
  const searchInputRef = useRef<TextInput | null>(null);

  // 텍스트가 있으면 X 버튼, 없으면 검색 버튼
  const showXButton = showCloseButton && value.length > 0;
  const showSearchButton = !showXButton;

  useEffect(() => {
    setSearchInputRef(searchInputRef);
  }, [searchInputRef]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={showSearchOverlay}
      style={[tw('w-full'), { maxWidth: 330 }]}
    >
      <View
        style={[
          tw(
            'flex-row items-center bg-surface-secondary rounded-lg border px-2 py-2 h-12',
          ),
          isFocused ? tw('border-brand-primary') : tw('border-line-default'),
        ]}
      >
        {/* 뒤로가기 버튼 */}
        {showBackButton && (
          <TouchableOpacity onPress={onPressBack} style={tw('p-1')}>
            <IconBackArrow color="gray" />
          </TouchableOpacity>
        )}

        {/* 검색 입력 필드 */}
        <View style={tw('flex-1 flex-row items-center justify-center h-12')}>
          <TextInput
            ref={searchInputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={
              selectedPlaceInfoForModal?.name ?? '오늘은 어디로 갈까요?'
            }
            placeholderTextColor="#A7A7A7"
            style={[
              tw(
                'flex-1 font-primary-600 text-base text-on-surface-primary h-full m-0 p-0 leading-5 ml-4',
              ),
              {
                textAlignVertical: 'center',
                includeFontPadding: false,
              },
            ]}
            onSubmitEditing={onSubmit}
            onFocus={onFocus}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
          />

          {/* 오른쪽 버튼 (X 버튼과 검색 버튼 토글) */}
          <View style={tw('w-8 h-8 items-center justify-center')}>
            {showXButton ? (
              <TouchableOpacity
                onPress={onPressClose}
                style={tw('p-1')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconClose color="#77838F" />
              </TouchableOpacity>
            ) : showSearchButton ? (
              <TouchableOpacity
                onPress={onPressSearch}
                style={tw('p-1')}
                disabled={showSearchOverlay}
              >
                <IconSearch color="#77838F" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchBar;
