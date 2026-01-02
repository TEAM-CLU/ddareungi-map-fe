import React from 'react';
import { render } from '@testing-library/react-native';
import InstructionBanner from '@/features/navigation/components/InstructionBanner';
import { TailwindProvider } from '@/app/providers/tailwind/provider';

function renderWithProvider(ui: React.ReactElement) {
  return render(<TailwindProvider>{ui}</TailwindProvider>);
}

describe('InstructionBanner', () => {
  it('renders instruction text split into lines', () => {
    const { getByText } = renderWithProvider(
      <InstructionBanner instruction="좌회전 후 100m 직진하세요" sign={1} />,
    );
    expect(getByText('좌회전 후 100m')).toBeTruthy();
    expect(getByText('직진하세요')).toBeTruthy();
  });

  it('renders direction icon', () => {
    const { getByTestId } = renderWithProvider(
      <InstructionBanner instruction="우회전 후 200m 직진" sign={2} />,
    );
    expect(getByTestId('direction-icon')).toBeTruthy();
  });
});
