import { TouchableOpacity, View, Text } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import {
  IconBackArrow,
  IconClose,
  IconSearch,
} from '@/shared/components/icons';
import { TextInput } from 'react-native-gesture-handler';
import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onPressSearch?: () => void;
  onPressBack?: () => void;
  onPressClose?: () => void;
  onPress?: () => void; // 전체 영역 클릭 핸들러
  readOnly?: boolean;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  autoFocus?: boolean;
}

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = '오늘은 어디로 갈까요?',
  onPressSearch,
  onPressBack,
  onPressClose,
  onPress,
  readOnly = false,
  showBackButton = false,
  showCloseButton = false,
  autoFocus = false,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // 텍스트가 있으면 X 버튼, 없으면 검색 버튼
  const showXButton = showCloseButton && value.length > 0;
  const showSearchButton = !showXButton;

  // readOnly이고 onPress가 있으면 전체를 TouchableOpacity로 감싸기
  const Wrapper = readOnly && onPress ? TouchableOpacity : View;
  const wrapperProps =
    readOnly && onPress
      ? {
          onPress,
          activeOpacity: 0.8,
        }
      : {};

  return (
    <Wrapper
      {...wrapperProps}
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
        {readOnly ? (
          <View style={tw('flex-1 justify-center items-start ml-4')}>
            <Text
              style={[
                tw('font-primary-600 text-base text-on-surface-primary'),
                {
                  includeFontPadding: false,
                },
              ]}
            >
              {value || placeholder}
            </Text>
          </View>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#414548"
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus={autoFocus}
            returnKeyType="search"
          />
        )}

        {/* 오른쪽 버튼 (X 버튼과 검색 버튼 토글) */}
        <View style={tw('w-8 h-8 items-center justify-center')}>
          {showXButton ? (
            <TouchableOpacity onPress={onPressClose} style={tw('p-1')}>
              <IconClose color="#77838F" />
            </TouchableOpacity>
          ) : showSearchButton ? (
            <TouchableOpacity onPress={onPressSearch} style={tw('p-1')}>
              <IconSearch color="#77838F" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Wrapper>
  );
};

export default SearchBar;
