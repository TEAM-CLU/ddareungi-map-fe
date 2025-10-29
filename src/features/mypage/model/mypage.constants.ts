export const MYPAGE_MENU_ITEMS = [
  { key: 'updateInfo', label: '내 정보 수정' },
  { key: 'updatePassword', label: '비밀번호 변경' },
  { key: 'help', label: '도움말' },
] as const;

export const DUMMY_USER_INFO = {
  name: '홍길동',
  email: 'hongildong@example.com',
  birthDate: '2000-05-12',
  gender: 'F',
  address: '서울특별시-강남구-역삼동',
  totalDistance: 12500, // meter
  totalTime: 3600, // seconds
  calories: 215, // kcal
  carbonSaved: 1.8, // kg
  treesPlanted: 20,
};