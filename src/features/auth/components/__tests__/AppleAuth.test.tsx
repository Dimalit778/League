import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
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
    jest.clearAllMocks();
  });

  it('exposes an accessible "Continue with Apple" label', async () => {
    const { getByLabelText } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} legalAccepted />,
    );

    await waitFor(() => {
      expect(getByLabelText('Continue with Apple')).toBeTruthy();
    });
  });

  it('renders the Continue button in sign-up mode too', async () => {
    const { getByLabelText } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} mode="signUp" legalAccepted />,
    );

    await waitFor(() => {
      expect(getByLabelText('Continue with Apple')).toBeTruthy();
    });
  });

  it('renders the native Sign in with Apple button', async () => {
    const { getByTestId } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} legalAccepted />,
    );

    await waitFor(() => {
      expect(getByTestId('apple-sign-in-button')).toBeTruthy();
    });
  });

  it('records server-side legal acceptance after authentication', async () => {
    const { getByTestId } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} mode="signUp" legalAccepted />,
    );

    await waitFor(() => {
      expect(getByTestId('apple-sign-in-button')).toBeTruthy();
    });
    fireEvent.press(getByTestId('apple-sign-in-button'));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('record_current_legal_acceptance', {
        p_source: 'apple',
        p_auth_flow: 'sign_up',
        p_locale: 'en',
        p_app_version: expect.any(String),
      });
    });
  });

  it('does not start authentication before legal acceptance', async () => {
    const { getByTestId } = render(
      <AppleAuth setIsLoading={jest.fn()} isLoading={false} mode="signUp" legalAccepted={false} />,
    );

    await waitFor(() => {
      expect(getByTestId('apple-sign-in-button')).toBeTruthy();
    });
    fireEvent.press(getByTestId('apple-sign-in-button'));

    expect(AppleAuthentication.signInAsync).not.toHaveBeenCalled();
  });
});
