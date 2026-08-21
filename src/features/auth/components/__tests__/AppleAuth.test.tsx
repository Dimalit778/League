import { render, waitFor } from '@testing-library/react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform, StyleSheet } from 'react-native';
import AppleAuth from '../AppleAuth';

jest.unmock('@/features/auth/components/AppleAuth');

describe('AppleAuth', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    (AppleAuthentication.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
  });

  it('exposes an accessible sign-in label without visible text', async () => {
    const { getByLabelText, queryByText } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} />,
    );

    await waitFor(() => {
      expect(getByLabelText('Sign in with Apple')).toBeTruthy();
    });
    expect(queryByText('Sign in with Apple')).toBeNull();
  });

  it('uses a sign-up accessibility label in sign-up mode', async () => {
    const { getByLabelText } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} mode="signUp" />,
    );

    await waitFor(() => {
      expect(getByLabelText('Sign up with Apple')).toBeTruthy();
    });
  });

  it('renders the bundled official Apple artwork at 52 points', async () => {
    const { getByTestId } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} />,
    );

    await waitFor(() => {
      const logo = getByTestId('apple-sign-in-logo');
      expect(logo.props.source).toBeTruthy();
      expect(StyleSheet.flatten(logo.props.style)).toMatchObject({ width: 52, height: 52 });
    });
  });
});
