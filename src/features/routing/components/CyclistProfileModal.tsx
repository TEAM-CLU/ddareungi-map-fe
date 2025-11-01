import ProfileButton from '@/features/routing/components/ProfileButton';
import { tw } from '@/shared/libs/tw-helper';
import { Text, View } from 'react-native';

interface CyclistProfileModalProps {
  setPreferenceEnv: React.Dispatch<
    React.SetStateAction<'urban' | 'nature' | 'balanced'>
  >;

  setCyclistSkillLevel: React.Dispatch<
    React.SetStateAction<'beginner' | 'intermediate' | 'expert'>
  >;

  setFatigueTolerance: React.Dispatch<
    React.SetStateAction<'lowFatigue' | 'mediumFatigue' | 'highFatigue'>
  >;

  setUsageType: React.Dispatch<
    React.SetStateAction<
      'daily' | 'workout' | 'commute' | 'travel' | 'delivery'
    >
  >;

  setCompanionType: React.Dispatch<
    React.SetStateAction<'alone' | 'friend' | 'child' | 'elderly'>
  >;
  PreferenceEnv: 'urban' | 'nature' | 'balanced';
  CyclistSkillLevel: 'beginner' | 'intermediate' | 'expert';
  FatigueTolerance: 'lowFatigue' | 'mediumFatigue' | 'highFatigue';
  UsageType: 'daily' | 'workout' | 'commute' | 'travel' | 'delivery';
  CompanionType: 'alone' | 'friend' | 'child' | 'elderly';
}
const CyclistProfileModal = ({
  setPreferenceEnv,
  setCyclistSkillLevel,
  setFatigueTolerance,
  setUsageType,
  setCompanionType,
  PreferenceEnv,
  CyclistSkillLevel,
  FatigueTolerance,
  UsageType,
  CompanionType,
}: CyclistProfileModalProps) => {
  return (
    <View
      style={[
        tw('w-full bg-surface-primary flex flex-col items-center'),
        { gap: 20 },
      ]}
    >
      <Text
        style={[
          tw('font-primary-700 text-on-surface-primary'),
          { fontSize: 20 },
        ]}
      >
        해당되는 프로필을 선택해주세요.
      </Text>
      <View style={[tw('w-full flex flex-col jutify-start'), { gap: 8 }]}>
        {/* 선호환경 */}
        <View
          style={[tw('flex flex-col w-full'), { gap: 4, marginBottom: 20 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface text-left'),
              { fontSize: 16 },
            ]}
          >
            선호 환경
          </Text>
          <View
            style={[
              tw('flex flex-row w-full justify-center items-center'),
              { gap: 10 },
            ]}
          >
            <ProfileButton
              title="도심"
              selected={PreferenceEnv === 'urban'}
              onPress={() => setPreferenceEnv('urban')}
            />
            <ProfileButton
              title="자연"
              selected={PreferenceEnv === 'nature'}
              onPress={() => setPreferenceEnv('nature')}
            />
            <ProfileButton
              title="균형"
              selected={PreferenceEnv === 'balanced'}
              onPress={() => setPreferenceEnv('balanced')}
            />
          </View>
        </View>
        {/* 자전거 숙련도 */}
        <View
          style={[tw('flex flex-col w-full'), { gap: 4, marginBottom: 20 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface text-left'),
              { fontSize: 16 },
            ]}
          >
            자전거 숙련도
          </Text>
          <View
            style={[
              tw('flex flex-row w-full justify-center items-center'),
              { gap: 10 },
            ]}
          >
            <ProfileButton
              title="초보자"
              selected={CyclistSkillLevel === 'beginner'}
              onPress={() => setCyclistSkillLevel('beginner')}
            />
            <ProfileButton
              title="중급자"
              selected={CyclistSkillLevel === 'intermediate'}
              onPress={() => setCyclistSkillLevel('intermediate')}
            />
            <ProfileButton
              title="전문가"
              selected={CyclistSkillLevel === 'expert'}
              onPress={() => setCyclistSkillLevel('expert')}
            />
          </View>
        </View>
        {/* 피로 허용도 */}
        <View
          style={[tw('flex flex-col w-full'), { gap: 4, marginBottom: 20 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface text-left'),
              { fontSize: 16 },
            ]}
          >
            피로 허용도
          </Text>
          <View
            style={[
              tw('flex flex-row w-full justify-center items-center'),
              { gap: 10 },
            ]}
          >
            <ProfileButton
              title="체력 저"
              selected={FatigueTolerance === 'lowFatigue'}
              onPress={() => setFatigueTolerance('lowFatigue')}
            />
            <ProfileButton
              title="체력 중"
              selected={FatigueTolerance === 'mediumFatigue'}
              onPress={() => setFatigueTolerance('mediumFatigue')}
            />
            <ProfileButton
              title="체력 고"
              selected={FatigueTolerance === 'highFatigue'}
              onPress={() => setFatigueTolerance('highFatigue')}
            />
          </View>
        </View>
        {/* 이용 유형 */}
        <View
          style={[tw('flex flex-col w-full'), { gap: 4, marginBottom: 20 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface text-left'),
              { fontSize: 16 },
            ]}
          >
            이용 유형
          </Text>
          <View
            style={[
              tw('flex flex-row w-full justify-center items-center'),
              { gap: 10 },
            ]}
          >
            <ProfileButton
              title="일상"
              selected={UsageType === 'daily'}
              onPress={() => setUsageType('daily')}
            />
            <ProfileButton
              title="운동"
              selected={UsageType === 'workout'}
              onPress={() => setUsageType('workout')}
            />
            <ProfileButton
              title="출/퇴근"
              selected={UsageType === 'commute'}
              onPress={() => setUsageType('commute')}
            />
            <ProfileButton
              title="여행"
              selected={UsageType === 'travel'}
              onPress={() => setUsageType('travel')}
            />
            <ProfileButton
              title="배달"
              selected={UsageType === 'delivery'}
              onPress={() => setUsageType('delivery')}
            />
          </View>
        </View>
        {/* 동반유형 */}
        <View
          style={[tw('flex flex-col w-full'), { gap: 4, marginBottom: 20 }]}
        >
          <Text
            style={[
              tw('font-primary-600 text-on-surface text-left'),
              { fontSize: 16 },
            ]}
          >
            동반 유형
          </Text>
          <View
            style={[
              tw('flex flex-row w-full justify-center items-center'),
              { gap: 10 },
            ]}
          >
            <ProfileButton
              title="혼자"
              selected={CompanionType === 'alone'}
              onPress={() => setCompanionType('alone')}
            />
            <ProfileButton
              title="친구"
              selected={CompanionType === 'friend'}
              onPress={() => setCompanionType('friend')}
            />
            <ProfileButton
              title="아이"
              selected={CompanionType === 'child'}
              onPress={() => setCompanionType('child')}
            />
            <ProfileButton
              title="노약자"
              selected={CompanionType === 'elderly'}
              onPress={() => setCompanionType('elderly')}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CyclistProfileModal;
