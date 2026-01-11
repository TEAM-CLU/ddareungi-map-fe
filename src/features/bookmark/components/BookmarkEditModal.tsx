import { tw } from '@/shared/libs/tw-helper';
import { useBookmarkStore } from '@/features/bookmark/stores/useBookmarkStore';
import { ActivityIndicator, Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useState } from 'react';
import BookmarkEditItem from './BookmarkEditItem';

const BookmarkEditModal = () => {
  const {
    bookmarks,
    removeBookmark,
    updateBookmarkAlias,
    updateBookmarkColor,
    _hasHydrated,
  } = useBookmarkStore();

  // 현재 수정 중인 아이템의 ID
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleToggleEdit = useCallback((id: string) => {
    setEditingId(prev => (prev === id ? null : id));
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      removeBookmark(id);
      setEditingId(prev => (prev === id ? null : prev));
    },
    [removeBookmark],
  );

  if (!_hasHydrated) {
    return (
      <View style={tw('flex justify-center w-full flex-1 items-center')}>
        <ActivityIndicator size="large" color="#C4C4C4" />
      </View>
    );
  }

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
        keyboardShouldPersistTaps="handled"
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
          bookmarks.map(item => (
            <BookmarkEditItem
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              onToggleEdit={handleToggleEdit}
              onDelete={handleRemove}
              onUpdateAlias={updateBookmarkAlias}
              onUpdateColor={updateBookmarkColor}
            />
          ))
        )}
      </BottomSheetScrollView>
    </View>
  );
};
export default BookmarkEditModal;
