import { act, fireEvent, render } from '@testing-library/react-native';
import { ActivityIndicator, TextInput } from 'react-native';

import PredictionForm from '../PredictionForm';

const mockMutateAsync = jest.fn();
const upsertState = { isPending: false };

jest.mock('@/features/predictions/hooks/usePredictions', () => ({
  useUpsertPrediction: () => ({
    get isPending() {
      return upsertState.isPending;
    },
    mutateAsync: mockMutateAsync,
  }),
}));

jest.mock('@/store/PrimaryLeagueStore', () => ({
  useMemberId: () => 'member-1',
}));

describe('PredictionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    upsertState.isPending = false;
    mockMutateAsync.mockResolvedValue({ match_id: 42 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('changes the score with buttons and prevents negative values', () => {
    const { getByRole, getByText, UNSAFE_queryAllByType } = render(<PredictionForm matchId={42} />);

    const decreaseHome = getByRole('button', { name: 'Decrease home score' });
    expect(decreaseHome.props.accessibilityState).toEqual({ disabled: true });
    expect(UNSAFE_queryAllByType(TextInput)).toHaveLength(0);

    fireEvent.press(getByRole('button', { name: 'Increase home score' }));

    expect(getByText('1')).toBeTruthy();
  });

  it('shows loading then a check after a successful save, then returns to Save', async () => {
    jest.useFakeTimers();

    let resolveSave: (value: { match_id: number }) => void = () => undefined;
    mockMutateAsync.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    );

    const { getByRole, rerender, UNSAFE_queryAllByType } = render(<PredictionForm matchId={42} />);

    fireEvent.press(getByRole('button', { name: 'Increase home score' }));
    fireEvent.press(getByRole('button', { name: 'Save' }));

    upsertState.isPending = true;
    rerender(<PredictionForm matchId={42} />);

    expect(UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(1);

    upsertState.isPending = false;
    await act(async () => {
      resolveSave({ match_id: 42 });
    });

    expect(getByRole('button', { name: 'Saved' })).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(getByRole('button', { name: 'Save' })).toBeTruthy();
  });
});
