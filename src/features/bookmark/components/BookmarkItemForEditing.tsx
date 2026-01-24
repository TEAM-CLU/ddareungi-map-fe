import { IconClose } from '@/shared/components/icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { tw } from '@/shared/libs/tw-helper';
import { BOOKMARK_COLOR_PRESETS } from '@/shared/model/index.constants';
import { BookmarkItem } from '@/features/bookmark/model/bookmark.types';
import BookmarkColorEditionButton from '@/features/bookmark/components/BookmarkColorEditionButton';

interface BookmarkItemForEditingProps {
  item: BookmarkItem;
  isEditing: boolean;
  onToggleEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateAlias: (id: string, alias: string) => void;
  onUpdateColor: (id: string, color: string) => void;
}

const BookmarkItemForEditing = ({
  item,
  isEditing,
  onToggleEdit,
  onDelete,
  onUpdateAlias,
  onUpdateColor,
}: BookmarkItemForEditingProps) => {
  const [alias, setAlias] = useState(item.alias || item.name);

  useEffect(() => {
    if (isEditing) {
      setAlias(item.alias || item.name);
    }
  }, [isEditing, item.alias, item.name]);

  // 입력 종료 시 자동 저장
  const handleEndEditing = useCallback(() => {
    if (alias !== (item.alias || item.name)) {
      onUpdateAlias(item.id, alias);
    }
  }, [alias, item.alias, item.name, item.id, onUpdateAlias]);

  const handleResetAlias = useCallback(() => {
    setAlias(item.name);
    onUpdateAlias(item.id, item.name);
  }, [item.id, item.name, onUpdateAlias]);

  const handleToggleEnteringEditModePress = useCallback(() => {
    onToggleEdit(item.id);
  }, [onToggleEdit, item.id]);

  const handleDeleteBookmarkPress = useCallback(() => {
    Alert.alert(
      '즐겨찾기 삭제',
      `'${item.alias || item.name}'을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ],
    );
  }, [item.alias, item.id, item.name, onDelete]);

  const handleChangeColorPress = useCallback(
    (color: string) => {
      // 이미 선택된 색상이면 업데이트 호출 안 함
      if (item.color !== color) {
        onUpdateColor(item.id, color);
      }
    },
    [item.color, item.id, onUpdateColor],
  );

  return (
    <View style={[tw('bg-white border-b'), { borderColor: '#E5E7EB' }]}>
      {/* 1. 요약 헤더 영역 (항상 보임) */}
      <TouchableOpacity
        style={tw('flex-row justify-between items-center px-6 py-5')}
        onPress={handleToggleEnteringEditModePress}
        activeOpacity={0.6}
      >
        <View style={tw('flex-row items-center flex-1 pr-4')}>
          {/* 색상 닷 */}
          <View
            style={[
              tw('w-4 h-4 rounded-full mr-4 border'),
              {
                backgroundColor: item.color,
                borderColor: 'rgba(0, 0, 0, 0.05)',
              },
            ]}
          />
          <View style={tw('flex-1')}>
            <View style={tw('flex-row items-center')}>
              <Text
                style={tw(
                  'text-base font-primary-700 text-on-surface-primary mr-2',
                )}
                numberOfLines={1}
              >
                {item.alias || item.name}
              </Text>
              {isEditing && (
                <View
                  style={[
                    tw('px-1.5 py-0.5 rounded'),
                    { backgroundColor: '#01DA861A' },
                  ]}
                >
                  <Text
                    style={tw('text-xs text-brand-primary font-primary-600')}
                  >
                    편집 중
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={tw(
                'text-sm text-on-surface-tertiary font-primary-400 mt-0.5',
              )}
              numberOfLines={1}
            >
              {item.address}
            </Text>
          </View>
        </View>

        {/* 삭제 버튼 */}
        <TouchableOpacity
          onPress={handleDeleteBookmarkPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={tw('p-1')}
        >
          <IconClose width={12} height={12} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 2. 편집 영역 (isEditing일 때만 보임) */}
      {isEditing && (
        <View style={tw('px-6 pb-6 pt-4 bg-gray-50')}>
          {/* 별칭 입력 헤더 */}
          <View style={tw('flex-row justify-between items-center mb-2 ml-1')}>
            <Text
              style={tw('text-xs text-on-surface-tertiary font-primary-600')}
            >
              별칭
            </Text>
            <TouchableOpacity onPress={handleResetAlias}>
              <Text style={tw('text-xs text-brand-primary font-primary-500')}>
                별칭 초기화
              </Text>
            </TouchableOpacity>
          </View>

          <BottomSheetTextInput
            style={tw(
              'bg-white border-0 rounded-xl px-4 py-3.5 text-on-surface-primary font-primary-500 mb-5 shadow-sm',
            )}
            value={alias}
            onChangeText={setAlias}
            onEndEditing={handleEndEditing}
            placeholder="장소 별칭을 입력해주세요"
            returnKeyType="done"
            placeholderTextColor="#A1A1AA"
          />

          {/* 색상 선택기 */}
          <Text
            style={tw(
              'text-xs text-on-surface-tertiary font-primary-600 mb-3 ml-1',
            )}
          >
            색상
          </Text>
          <View style={[tw('flex-row flex-wrap'), { gap: 10 }]}>
            {BOOKMARK_COLOR_PRESETS.map(color => {
              return (
                <BookmarkColorEditionButton
                  key={color}
                  color={color}
                  isSelected={item.color === color}
                  onPress={handleChangeColorPress}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

export default memo(BookmarkItemForEditing);
