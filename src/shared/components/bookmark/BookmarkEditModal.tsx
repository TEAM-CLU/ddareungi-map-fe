import { tw } from '@/shared/libs/tw-helper';
import { useBookmarkStore } from '@/shared/stores/useBookmarkStore';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BOOKMARK_COLOR_PRESETS } from '@/shared/model/index.constants';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { BookmarkItem } from '@/shared/model/index.types';
import { IconClose } from '../icons';

const BookmarkEditModal = () => {
  const {
    bookmarks,
    removeBookmark,
    updateBookmarkAlias,
    updateBookmarkColor,
  } = useBookmarkStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAlias, setTempAlias] = useState<string>('');

  // 아코디언 토글 함수
  const toggleItem = (item: BookmarkItem) => {
    if (editingId === item.id) {
      // 이미 열려있으면 닫기
      setEditingId(null);
    } else {
      // 새로 열 때: ID 설정하고, 현재 스토어에 저장된 별칭을 임시 State로 가져옴
      setEditingId(item.id);
      setTempAlias(item.alias || item.name);
    }
  };

  const handleEndEditing = (id: string) => {
    updateBookmarkAlias(id, tempAlias);
  };

  return (
    <View style={tw('flex-1 bg-white')}>
      {/* 헤더 영역 */}
      <View
        style={[
          tw('px-6 pt-6 pb-4 mb-4 border-b '),
          { borderColor: '#E5E7EB' },
        ]}
      >
        <Text style={tw('font-primary-700 text-xl text-on-surface-primary')}>
          즐겨찾기 관리{' '}
          <Text style={tw('text-brand-primary')}>{bookmarks.length}</Text>
        </Text>
      </View>

      {/* 리스트 영역 */}
      <BottomSheetScrollView
        style={tw('flex-1')}
        contentContainerStyle={tw('pb-10')}
      >
        {bookmarks.length === 0 ? (
          <View style={tw('items-center justify-center py-20')}>
            <Text
              style={tw('text-on-surface-tertiary text-base font-primary-500')}
            >
              저장된 즐겨찾기가 없습니다.
            </Text>
          </View>
        ) : (
          bookmarks.map((item, index) => {
            const isEditing = editingId === item.id;
            const isLast = index === bookmarks.length - 1;

            return (
              <View
                key={item.id}
                style={[
                  tw('bg-white'),
                  !isLast && tw('border-b'),
                  { borderColor: '#E5E7EB' },
                ]}
              >
                {/* 1. 아이템 헤더 (클릭 시 펼치기/접기) */}
                <TouchableOpacity
                  style={tw('flex-row justify-between items-center px-6 py-5')}
                  onPress={() => toggleItem(item)}
                  activeOpacity={0.6}
                >
                  <View style={tw('flex-row items-center flex-1 pr-4')}>
                    {/* 색상 닷 (Dot) */}
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
                              tw('bg-brand-primary px-1.5 py-0.5 rounded'),
                              { backgroundColor: '#01DA861A' },
                            ]}
                          >
                            <Text
                              style={tw(
                                'text-xs text-brand-primary font-primary-600',
                              )}
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
                    onPress={() => removeBookmark(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={tw('p-1')}
                  >
                    <IconClose width={12} height={12} color="#999" />
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* 2. 편집 영역 - 선택된 경우에만 렌더링 */}
                {isEditing && (
                  <View style={tw('px-6 pb-6 pt-4 bg-gray-100')}>
                    {/* 별칭 수정 */}
                    <Text
                      style={tw(
                        'text-xs text-on-surface-tertiary font-primary-600 ml-1 mb-2',
                      )}
                    >
                      별칭
                    </Text>
                    <TextInput
                      style={tw(
                        'bg-white border-0 rounded-xl px-4 py-3.5 text-on-surface-primary font-primary-500 mb-5 shadow-sm',
                      )}
                      value={tempAlias}
                      onChangeText={text => setTempAlias(text)}
                      onEndEditing={() => handleEndEditing(item.id)}
                      placeholder="장소 별칭을 입력해주세요"
                      returnKeyType="done"
                      placeholderTextColor="#A1A1AA"
                    />

                    {/* 색상 선택 */}
                    <Text
                      style={tw(
                        'text-xs text-on-surface-tertiary font-primary-600 mb-3 ml-1',
                      )}
                    >
                      색상
                    </Text>
                    <View style={[tw('flex-row flex-wrap'), { gap: 8 }]}>
                      {BOOKMARK_COLOR_PRESETS.map(color => {
                        const isSelected = item.color === color;
                        return (
                          <TouchableOpacity
                            key={color}
                            style={[
                              tw(
                                'w-9 h-9 rounded-full items-center justify-center mr-3 mb-2',
                              ),
                              { backgroundColor: color },

                              isSelected && {
                                borderColor: '#E5E7EB',
                                borderWidth: 2,
                                padding: 3,
                              },
                            ]}
                            onPress={() => updateBookmarkColor(item.id, color)}
                            activeOpacity={0.8}
                          />
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </BottomSheetScrollView>
    </View>
  );
};
export default BookmarkEditModal;
