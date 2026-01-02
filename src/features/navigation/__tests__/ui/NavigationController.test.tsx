import React from 'react';
import { render } from '@testing-library/react-native';
import NavigationController from '@/features/navigation/components/NavigationController';
import { TailwindProvider } from '@/app/providers/tailwind/provider';

describe('NavigationController', () => {
  function renderWithProvider(props: any) {
    return render(
      <TailwindProvider>
        <NavigationController {...props} />
      </TailwindProvider>,
    );
  }

  it('예상 도착시간: null(로딩)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: null,
      remainingDistance: 1000,
      traveledDistance: 500,
    });
    expect(getByText('예상 도착시간: 시간을 계산 중이에요')).toBeTruthy();
  });

  it('예상 도착시간: undefined(에러)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: undefined,
      remainingDistance: 1000,
      traveledDistance: 500,
    });
    expect(getByText('예상 도착시간: 시간을 측정할 수 없어요')).toBeTruthy();
  });

  it('예상 도착시간: 정상 Date', () => {
    const date = new Date(2023, 0, 1, 15, 7);
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: date,
      remainingDistance: 1000,
      traveledDistance: 500,
    });
    expect(getByText('예상 도착시간: 03:07PM')).toBeTruthy();
  });

  it('남은 거리: null(로딩)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: null,
      traveledDistance: 500,
    });
    expect(getByText('거리를 계산 중이에요')).toBeTruthy();
  });

  it('남은 거리: undefined(에러)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: undefined,
      traveledDistance: 500,
    });
    expect(getByText('거리를 찾을 수 없어요')).toBeTruthy();
  });

  it('남은 거리: 1500m(1.5km)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: 1500,
      traveledDistance: 500,
    });
    expect(getByText('1.5km 남음')).toBeTruthy();
  });

  it('남은 거리: 800m', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: 800,
      traveledDistance: 500,
    });
    expect(getByText('800m 남음')).toBeTruthy();
  });

  it('소요거리: null(로딩)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: 1000,
      traveledDistance: null,
    });
    expect(getByText('소요거리: 거리를 계산 중이에요')).toBeTruthy();
  });

  it('소요거리: undefined(에러)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: 1000,
      traveledDistance: undefined,
    });
    expect(getByText('소요거리: 거리를 찾을 수 없어요')).toBeTruthy();
  });

  it('소요거리: 2000m(2.0km)', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: 1000,
      traveledDistance: 2000,
    });
    expect(getByText('소요거리: 2.0km')).toBeTruthy();
  });

  it('소요거리: 300m', () => {
    const { getByText } = renderWithProvider({
      estimatedArrivalTime: new Date(),
      remainingDistance: 1000,
      traveledDistance: 300,
    });
    expect(getByText('소요거리: 300m')).toBeTruthy();
  });
});
