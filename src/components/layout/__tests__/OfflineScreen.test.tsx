import NetInfo from '@react-native-community/netinfo';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { OfflineScreen } from '../OfflineScreen';

describe('OfflineScreen', () => {
  it('shows the offline message', () => {
    const { getByText } = render(<OfflineScreen />);

    expect(getByText("You're offline")).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('re-checks connectivity when Try Again is pressed', async () => {
    const { getByText } = render(<OfflineScreen />);

    fireEvent.press(getByText('Try Again'));

    await waitFor(() => expect(NetInfo.refresh).toHaveBeenCalledTimes(1));
  });
});
