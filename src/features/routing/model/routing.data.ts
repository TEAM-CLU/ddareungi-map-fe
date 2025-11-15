import { RoutePoint } from './routing.types';

// 기본 출발지 포인트 생성 함수
export const createStartPoint = (value: string = ''): RoutePoint => ({
  fieldKey: 'start',
  placeholder: '출발지',
  value,
  type: 'start',
});

// 기본 도착지 포인트 생성 함수
export const createEndPoint = (value: string = ''): RoutePoint => ({
  fieldKey: 'end',
  placeholder: '도착지',
  value,
  type: 'end',
});
