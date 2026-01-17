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
import IconClose from '@/shared/components/icons/IconClose';
import { tw } from '@/shared/libs/tw-helper';
import {
  clampTags,
  formatCalories,
  formatDistance,
  formatTimeHHMMSS,
} from '@/shared/utils/formatting';

interface StoryShareScreenProps {
  traveledDistance: number;
  seconds: number;
  calories: number;
  onClose: () => void;
}

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
        console.error('Camera permission error:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const clampedTags = useMemo(() => clampTags(tagList), [tagList]);
  const distanceText = useMemo(
    () => formatDistance(traveledDistance, 2),
    [traveledDistance],
  );
  const durationText = useMemo(() => formatTimeHHMMSS(seconds), [seconds]);
  const caloriesText = useMemo(() => formatCalories(calories), [calories]);

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
      console.log('Failed to delete temp file:', e);
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
      {/* 닫기 버튼 */}
      <TouchableOpacity
        style={[
          tw('absolute top-12 right-5 p-2.5 rounded-full bg-black'),
          { zIndex: 10000, opacity: 0.7 },
        ]}
        onPress={handleClosePress}
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
            tw('absolute left-5 right-5 rounded-2xl overflow-hidden bg-black'),
            { top: 100, aspectRatio: 9 / 16 },
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

          {/* 상단 태그 */}
          <View style={[tw('absolute left-5 right-5'), { top: 25 }]}>
            <View style={[tw('flex flex-row flex-wrap'), { gap: 8 }]}>
              {clampedTags.map((text: string, idx: number) => (
                <View
                  key={`${text}-${idx}`}
                  style={[
                    tw(
                      'px-3 py-2 rounded-full bg-black border border-brand-primary',
                    ),
                    { opacity: 0.6 },
                  ]}
                >
                  <Text
                    style={[
                      tw('text-brand-primary font-primary-700'),
                      { fontSize: 15, zIndex: 10 },
                    ]}
                  >
                    #{text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 하단 메트릭 카드 */}
          <View style={[tw('absolute left-4 right-4'), { bottom: 30 }]}>
            <View style={[tw('p-4 rounded-2xl flex-row justify-between')]}>
              <Text
                style={[
                  tw('text-on-surface-secondary font-primary-700'),
                  { fontSize: 19 },
                ]}
              >
                {distanceText}
              </Text>
              <Text
                style={[
                  tw('text-on-surface-secondary font-primary-700'),
                  { fontSize: 19 },
                ]}
              >
                {durationText}
              </Text>
              <Text
                style={[
                  tw('text-on-surface-secondary font-primary-700'),
                  { fontSize: 19 },
                ]}
              >
                {caloriesText}
              </Text>
            </View>
          </View>

          {/* 워터마크 */}
          <Text
            style={[
              tw('absolute right-3 font-secondary text-brand-primary'),
              { bottom: 10, opacity: 0.8, fontSize: 13, lineHeight: 22 },
            ]}
          >
            따릉이맵
          </Text>
        </ViewShot>
      )}

      {/* 하단 버튼들 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={[
          tw('absolute left-0 right-0 px-6 items-center flex flex-col'),
          { bottom: 60, gap: 12 },
        ]}
      >
        {photoUri ? (
          <View style={[tw('flex flex-row w-full'), { gap: 12 }]}>
            <TouchableOpacity
              style={[
                tw(
                  'flex-1 px-6 py-3 rounded-full items-center justify-center border-2 border-white bg-black',
                ),
                { opacity: 0.7 },
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
              style={tw(
                'flex-1 px-6 py-3 rounded-full items-center justify-center bg-brand-primary',
              )}
              onPress={handleShareStoryPress}
            >
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
                  'w-full rounded-2xl p-3 flex flex-col justify-center bg-black',
                ),
                { opacity: 0.7, minHeight: 100 },
              ]}
            >
              <View style={{ gap: 8 }}>
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
                          { gap: 4 },
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
                        { opacity: 0.7, fontSize: 13 },
                      ]}
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="태그를 입력하세요 (최대 3개)"
                      placeholderTextColor="#B3B3B3"
                      onSubmitEditing={handleAddTagPress}
                      returnKeyType="done"
                    />
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
                    'rounded-full border border-brand-primary bg-surface-primary flex justify-center items-center',
                  ),
                  {
                    width: 50,
                    height: 50,
                    opacity: 0.7,
                    borderWidth: 4,
                  },
                ]}
                onPress={takePhotoPress}
              >
                <Text>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  tw(
                    'px-3 py-2 rounded-full border border-brand-primary bg-black flex justify-center items-center absolute right-0',
                  ),
                  { opacity: 0.7 },
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
