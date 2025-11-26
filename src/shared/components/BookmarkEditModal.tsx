import { tw } from '@/shared/libs/tw-helper';
import { useBookmarkStore } from '@/shared/stores/useBookmarkStore';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BOOKMARK_COLOR_PRESETS } from '@/shared/model/index.constants';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { BookmarkItem } from '@/shared/model/index.types';

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
    <View style={tw('flex-1 bg-white pt-5 pb-10')}>
      {/* 헤더 영역 */}
      <View style={tw('px-5 mb-4 border-b border-gray-100 pb-4')}>
        <Text style={tw('text-lg font-bold text-gray-900')}>
          즐겨찾기 관리 ({bookmarks.length})
        </Text>
      </View>

      {/* 리스트 영역 */}
      <BottomSheetScrollView style={tw('flex-1')}>
        {bookmarks.length === 0 ? (
          <View style={tw('items-center mt-10')}>
            <Text style={tw('text-gray-400')}>저장된 즐겨찾기가 없습니다.</Text>
          </View>
        ) : (
          bookmarks.map(item => {
            const isEditing = editingId === item.id;

            return (
              <View key={item.id} style={tw('border-b border-gray-100')}>
                {/* 1. 아이템 헤더 (클릭 시 펼치기/접기) */}
                <TouchableOpacity
                  style={tw('flex-row justify-between items-center p-5')}
                  onPress={() => toggleItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={tw('flex-row items-center flex-1')}>
                    {/* 색상 닷 (Dot) */}
                    <View
                      style={[
                        tw('w-3 h-3 rounded-full mr-3'),
                        { backgroundColor: item.color },
                      ]}
                    />
                    <View>
                      <Text style={tw('text-base font-bold text-gray-800')}>
                        {item.alias || item.name}
                      </Text>
                      <Text style={tw('text-xs text-gray-500 mt-1')}>
                        {item.address}
                      </Text>
                    </View>
                  </View>

                  {/* 삭제 버튼 */}
                  <TouchableOpacity
                    onPress={() => removeBookmark(item.id)}
                    style={tw('bg-gray-100 px-3 py-2 rounded')}
                  >
                    <Text style={tw('text-xs text-red-500 font-bold')}>
                      삭제
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* 2. 편집 영역 (아코디언 내용) - 선택된 경우에만 렌더링 */}
                {isEditing && (
                  <View style={tw('px-5 pb-6 bg-gray-50')}>
                    {/* 별칭 수정 */}
                    <Text style={tw('text-sm text-gray-500 mt-2 mb-2')}>
                      별칭 수정
                    </Text>
                    <TextInput
                      style={tw(
                        'bg-white border border-gray-200 rounded-lg p-3 text-base mb-4 placeholder-on-surface-placeholder',
                      )}
                      value={tempAlias}
                      onChangeText={text => setTempAlias(text)}
                      onEndEditing={() => handleEndEditing(item.id)}
                      placeholder="장소 별칭 입력"
                    />

                    {/* 색상 선택 */}
                    <Text style={tw('text-sm text-gray-500 mb-2')}>
                      마커 색상
                    </Text>
                    <View style={tw('flex-row flex-wrap')}>
                      {BOOKMARK_COLOR_PRESETS.map(color => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            tw('w-8 h-8 rounded-full border-2 mr-3'),
                            item.color === color
                              ? tw('border-gray-800')
                              : tw('border-transparent'),
                            { backgroundColor: color },
                          ]}
                          onPress={() => updateBookmarkColor(item.id, color)}
                        />
                      ))}
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
