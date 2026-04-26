import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import { tw } from '@/shared/libs/tw-helper';
import { clampTagList } from '@/features/navigation/utils/clampTagList';
import { handleCatch } from '@/shared/utils/errorHandler';
import {
  formatDistanceAdaptiveText,
  formatTimeHHMMSSNumber,
  formatCaloriesKcalText,
} from '@/shared/utils/formatting';
import { IconClose, IconShared } from '@/shared/components/icons';

interface ShareMetricItemProps {
  label: string;
  value: string;
  color: string;
}

interface ShareTagPillProps {
  text: string;
  index: number;
}

interface StoryShareScreenProps {
  traveledDistance: number;
  seconds: number;
  calories: number;
  onClose: () => void;
}

const CAPTURE_CARD_SIDE_OFFSET = 38;
const CAPTURE_CARD_TOP_OFFSET = 84;
const BRAND_TEXT = '따릉이맵';

const ShareMetricItem = ({ label, value, color }: ShareMetricItemProps) => {
  return (
    <View style={tw('flex-1 items-start')}>
      <Text
        style={[
          tw('font-primary-500'),
          { color, fontSize: 10, opacity: 0.72, marginBottom: 4 },
        ]}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.72}
        style={[
          tw('font-primary-700'),
          { color, fontSize: 17, width: '100%' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const ShareTagPill = ({ text, index }: ShareTagPillProps) => {
  const isPrimary = index === 0;

  return (
    <View
      style={[
        tw('px-3 py-1.5 rounded-full border'),
        {
          backgroundColor: isPrimary
            ? 'rgba(1,218,134,0.86)'
            : 'rgba(0,0,0,0.34)',
          borderColor: isPrimary
            ? 'rgba(255,255,255,0.62)'
            : 'rgba(255,255,255,0.22)',
        },
      ]}
    >
      <Text
        style={[
          tw('font-primary-700'),
          {
            color: isPrimary ? '#111827' : '#FFFFFF',
            fontSize: isPrimary ? 14 : 13,
            lineHeight: 18,
          },
        ]}
      >
        #{text}
      </Text>
    </View>
  );
};

const StoryShareScreen = ({
  traveledDistance,
  seconds,
  calories,
  onClose,
}: StoryShareScreenProps) => {
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  // 촬영된 사진 URI
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // 태그 관리
  const [tagList, setTagList] = useState<string[]>(['따릉이맵', '라이딩']);
  const [tagInput, setTagInput] = useState<string>('');

  // 메트릭 텍스트 다크/라이트 토글 (false = 라이트, true = 다크)
  const [isDarkMetrics, setIsDarkMetrics] = useState(false);
  const metricColor = isDarkMetrics ? '#000' : '#fff';

  // 공유 카드 캡처용
  const shotRef = useRef<ViewShot>(null);

  // 권한
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cameraPermission = await Camera.requestCameraPermission();
        setHasPermission(cameraPermission === 'granted');
      } catch (error) {
        handleCatch(error, { mode: 'silent' });
        setHasPermission(false);
      }
    })();
  }, []);

  const clampedTags = useMemo(() => clampTagList(tagList), [tagList]);
  const distanceText = useMemo(
    () => formatDistanceAdaptiveText(traveledDistance),
    [traveledDistance],
  );
  const durationText = useMemo(
    () => formatTimeHHMMSSNumber(seconds),
    [seconds],
  );
  const caloriesText = useMemo(
    () => formatCaloriesKcalText(calories),
    [calories],
  );

  const handleClosePress = () => {
    onClose();
  };

  const handleAddTagPress = () => {
    if (tagInput.trim() && tagList.length < 3) {
      setTagList([...tagList, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTagPress = (index: number) => {
    setTagList(tagList.filter((_, i) => i !== index));
  };

  const handleRetakePress = () => {
    setPhotoUri(null);
  };

  const takePhotoPress = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePhoto({
      flash: 'off',
    });

    // VisionCamera는 보통 file path를 줌 (플랫폼별 prefix 처리)
    const uri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;

    setPhotoUri(uri);
  };

  const pickFromGalleryPress = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleShareStoryPress = async () => {
    if (!shotRef.current || !shotRef.current.capture) return;

    const uri = await shotRef.current.capture();

    if (!uri) return;

    // 날짜로 파일명 생성 (YYYYMMDD)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const filename = `ddareungi_${year}${month}${day}.png`;

    // 원하는 이름으로 파일 복사
    const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;
    await RNFS.copyFile(uri, destPath);

    await Share.open({
      url: Platform.OS === 'android' ? `file://${destPath}` : destPath,
      type: 'image/png',
      failOnCancel: false,
    });

    // 공유 후 임시 파일 삭제
    try {
      await RNFS.unlink(destPath);
    } catch (e) {
      handleCatch(e, { mode: 'silent' });
    }
  };

  if (!device) {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          tw('bg-black'),
          { zIndex: 9999 },
        ]}
      >
        <TouchableOpacity
          style={[
            tw('absolute top-12 right-5 p-2.5 rounded-full'),
            { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 },
          ]}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconClose color="#FFFFFF" />
        </TouchableOpacity>
        <View style={tw('flex-1 items-center justify-center')}>
          <Text
            style={[
              tw('text-on-surface-secondary font-primary-600'),
              { fontSize: 15 },
            ]}
          >
            카메라 디바이스를 찾지 못했어요.
          </Text>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          tw('bg-black'),
          { zIndex: 9999 },
        ]}
      >
        <TouchableOpacity
          style={[
            tw('absolute top-12 right-5 p-2.5 rounded-full'),
            { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 },
          ]}
          onPress={handleClosePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconClose color="#FFFFFF" />
        </TouchableOpacity>
        <View style={tw('flex-1 items-center justify-center')}>
          <Text
            style={[
              tw('text-on-surface-secondary font-primary-600'),
              { fontSize: 15 },
            ]}
          >
            카메라 권한이 필요해요.
          </Text>
        </View>
      </View>
    );
  }

  // 1) 촬영 전: 카메라 화면 (항상 보이도록)
  return (
    <View
      style={[StyleSheet.absoluteFillObject, tw('bg-black'), { zIndex: 9999 }]}
    >
      {/* 다크/라이트 토글 (사진 촬영 후에만 표시) */}
      {photoUri && (
        <TouchableOpacity
          style={[
            tw('absolute top-12 left-5 px-3 py-2 rounded-full border'),
            {
              zIndex: 10000,
              backgroundColor: isDarkMetrics
                ? 'rgba(0,0,0,0.72)'
                : 'rgba(255,255,255,0.9)',
              borderColor: isDarkMetrics
                ? 'rgba(255,255,255,0.25)'
                : 'rgba(0,0,0,0.08)',
            },
          ]}
          onPress={() => setIsDarkMetrics(prev => !prev)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={[
              tw('font-primary-700'),
              { fontSize: 13, color: isDarkMetrics ? '#fff' : '#111827' },
            ]}
          >
            {isDarkMetrics ? '밝은 글자' : '어두운 글자'}
          </Text>
        </TouchableOpacity>
      )}

      {/* 닫기 버튼 */}
      <TouchableOpacity
        style={[
          tw('absolute top-12 right-5 p-2.5 rounded-full'),
          { zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.55)' },
        ]}
        onPress={handleClosePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconClose color="#FFFFFF" />
      </TouchableOpacity>

      {/* 카메라 프리뷰 */}
      {device && hasPermission && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
      )}

      {/* 촬영 후 오버레이 */}
      {photoUri && (
        <ViewShot
          ref={shotRef}
          style={[
            tw('absolute rounded-2xl overflow-hidden bg-black'),
            {
              top: CAPTURE_CARD_TOP_OFFSET,
              left: CAPTURE_CARD_SIDE_OFFSET,
              right: CAPTURE_CARD_SIDE_OFFSET,
              aspectRatio: 9 / 16,
            },
          ]}
          options={{
            format: 'png',
            quality: 1,
            result: 'tmpfile',
            width: 1080,
            height: 1920,
          }}
        >
          {/* 배경 이미지 */}
          <Image
            source={{ uri: photoUri }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.08)', 'transparent']}
            locations={[0, 0.55, 1]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 180,
            }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['transparent', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.72)']}
            locations={[0, 0.45, 1]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 260,
            }}
          />

          {/* 상단 태그 */}
          <View style={[tw('absolute left-5 right-5'), { top: 22 }]}>
            <Text
              style={[
                tw('font-secondary text-brand-primary'),
                { fontSize: 18, lineHeight: 24, marginBottom: 10 },
              ]}
            >
              {BRAND_TEXT}
            </Text>
            <View style={[tw('flex flex-row flex-wrap'), { gap: 7 }]}>
              {clampedTags.map((text: string, idx: number) => (
                <ShareTagPill
                  key={`${text}-${idx}`}
                  text={text}
                  index={idx}
                />
              ))}
            </View>
          </View>

          {/* 하단 메트릭 카드 */}
          <View style={[tw('absolute left-4 right-4'), { bottom: 34 }]}>
            <View
              style={[
                tw('px-4 py-3 rounded-2xl flex-row items-center border'),
                {
                  gap: 12,
                  backgroundColor: isDarkMetrics
                    ? 'rgba(255,255,255,0.78)'
                    : 'rgba(0,0,0,0.42)',
                  borderColor: isDarkMetrics
                    ? 'rgba(255,255,255,0.55)'
                    : 'rgba(255,255,255,0.18)',
                },
              ]}
            >
              <ShareMetricItem
                label="거리"
                value={distanceText}
                color={metricColor}
              />
              <ShareMetricItem
                label="시간"
                value={durationText}
                color={metricColor}
              />
              <ShareMetricItem
                label="칼로리"
                value={caloriesText}
                color={metricColor}
              />
            </View>
          </View>

          {/* 워터마크 */}
          <Text
            style={[
              tw('absolute right-4 font-primary-700 text-white'),
              { bottom: 12, opacity: 0.74, fontSize: 11, lineHeight: 16 },
            ]}
          >
            @{BRAND_TEXT}
          </Text>
        </ViewShot>
      )}

      {/* 하단 버튼들 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={[
          tw('absolute left-0 right-0 px-6 items-center flex flex-col'),
          { bottom: 42, gap: 12 },
        ]}
      >
        {photoUri ? (
          <View
            style={[
              tw('flex flex-row w-full rounded-2xl p-2'),
              { gap: 10, backgroundColor: 'rgba(0,0,0,0.42)' },
            ]}
          >
            <TouchableOpacity
              style={[
                tw(
                  'flex-1 px-5 py-3 rounded-xl items-center justify-center border',
                ),
                { borderColor: 'rgba(255,255,255,0.28)' },
              ]}
              onPress={handleRetakePress}
            >
              <Text
                style={[
                  tw('text-on-surface-secondary font-primary-700'),
                  { fontSize: 15 },
                ]}
              >
                다시 찍기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                tw(
                  'flex-1 px-5 py-3 rounded-xl items-center justify-center bg-brand-primary flex-row',
                ),
                { gap: 6 },
              ]}
              onPress={handleShareStoryPress}
            >
              <IconShared color="#111827" width={17} height={17} />
              <Text
                style={[
                  tw('text-on-surface-primary font-primary-700'),
                  { fontSize: 15 },
                ]}
              >
                공유하기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View
              style={[
                tw(
                  'w-full rounded-2xl p-4 flex flex-col justify-center border',
                ),
                {
                  minHeight: 108,
                  backgroundColor: 'rgba(0,0,0,0.52)',
                  borderColor: 'rgba(255,255,255,0.14)',
                },
              ]}
            >
              <View style={{ gap: 10 }}>
                {tagList.length > 0 && (
                  <View
                    style={[
                      tw('flex flex-row flex-wrap justify-center items-start'),
                      { gap: 8 },
                    ]}
                  >
                    {tagList.map((tag, idx) => (
                      <View
                        key={idx}
                        style={[
                          tw(
                            'flex-row items-center px-3 py-2 bg-brand-primary rounded-full',
                          ),
                          { gap: 5 },
                        ]}
                      >
                        <Text
                          style={[
                            tw('text-on-surface-primary font-primary-700'),
                            { fontSize: 15 },
                          ]}
                        >
                          #{tag}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTagPress(idx)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <IconClose width={12} height={12} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {tagList.length < 3 && (
                  <View
                    style={[
                      tw('flex flex-row items-center justify-center'),
                      { gap: 8 },
                    ]}
                  >
                    <TextInput
                      style={[
                        tw(
                          'flex-1 rounded-xl px-3 py-2 text-on-surface-primary bg-white',
                        ),
                        { fontSize: 13, minHeight: 42 },
                      ]}
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="태그를 입력하세요 (최대 3개)"
                      placeholderTextColor="#B3B3B3"
                      onSubmitEditing={handleAddTagPress}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={tw(
                        'w-10 h-10 rounded-xl bg-brand-primary items-center justify-center',
                      )}
                      onPress={handleAddTagPress}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          tw('font-primary-700 text-on-surface-primary'),
                          { fontSize: 20, lineHeight: 24 },
                        ]}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <View
              style={[
                tw(
                  'flex flex-row items-center justify-center mt-3 w-full relative',
                ),
                { gap: 16 },
              ]}
            >
              <TouchableOpacity
                style={[
                  tw(
                    'rounded-full bg-surface-primary flex justify-center items-center',
                  ),
                  {
                    width: 68,
                    height: 68,
                    borderWidth: 5,
                    borderColor: '#FFFFFF',
                  },
                ]}
                onPress={takePhotoPress}
              >
                <View
                  style={[
                    tw('rounded-full bg-brand-primary'),
                    { width: 46, height: 46 },
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  tw(
                    'px-4 py-2 rounded-full border bg-black flex justify-center items-center absolute right-0',
                  ),
                  {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                ]}
                onPress={pickFromGalleryPress}
              >
                <Text
                  style={[
                    tw('text-on-surface-secondary font-primary-700'),
                    { fontSize: 15 },
                  ]}
                >
                  갤러리
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default StoryShareScreen;
