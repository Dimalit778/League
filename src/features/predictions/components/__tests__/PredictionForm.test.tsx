import { fireEvent, render } from '@testing-library/react-native';
import { TextInput } from 'react-native';

import PredictionForm from '../PredictionForm';

const mockMutateAsync = jest.fn();

jest.mock('@/features/predictions/hooks/usePredictions', () => ({
  useUpsertPrediction: () => ({
    isPending: false,
    mutateAsync: mockMutateAsync,
  }),
}));

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useMemberId: () => 'member-1',
}));

describe('PredictionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('changes the score with buttons and prevents negative values', () => {
    const onDraftChange = jest.fn();
    const { getByRole, getByText, UNSAFE_queryAllByType } = render(
      <PredictionForm matchId={42} onDraftChange={onDraftChange} />,
    );

    const decreaseHome = getByRole('button', { name: 'Decrease home score' });
    expect(decreaseHome.props.accessibilityState).toEqual({ disabled: true });
    expect(UNSAFE_queryAllByType(TextInput)).toHaveLength(0);

    fireEvent.press(getByRole('button', { name: 'Increase home score' }));

    expect(getByText('1')).toBeTruthy();
    expect(onDraftChange).toHaveBeenLastCalledWith({ hasChanges: true, isPending: false });
  });
});
