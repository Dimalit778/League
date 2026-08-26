import { fireEvent, render } from '@testing-library/react-native';
import { RefreshControl } from 'react-native';
import KnockoutEngine from '../KnockoutEngine';

describe('KnockoutEngine', () => {
  it('supports pull-to-refresh even when no knockout matches are available', () => {
    const onRefresh = jest.fn();
    const { UNSAFE_getByType } = render(
      <KnockoutEngine matches={[]} onRefresh={onRefresh} refreshing />,
    );
    const refreshControl = UNSAFE_getByType(RefreshControl);

    expect(refreshControl.props.refreshing).toBe(true);
    fireEvent(refreshControl, 'refresh');
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
