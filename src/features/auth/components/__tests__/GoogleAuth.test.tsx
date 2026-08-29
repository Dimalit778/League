import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import GoogleAuth from '../GoogleAuth';

describe('GoogleAuth', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    jest.clearAllMocks();
  });

  it('exposes an accessible sign in label', () => {
    const { getByLabelText, getByText } = render(
      <GoogleAuth setIsLoading={jest.fn()} isLoading={false} mode="signIn" legalAccepted />,
    );
    expect(getByLabelText('Continue with Google')).toBeTruthy();
    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('calls Google sign in when pressed on native', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const setIsLoading = jest.fn();
    const { getByRole } = render(
      <GoogleAuth setIsLoading={setIsLoading} isLoading={false} mode="signIn" legalAccepted />,
    );
    fireEvent.press(getByRole('button'));
    await waitFor(() => {
      expect(GoogleSignin.signIn).toHaveBeenCalledTimes(1);
    });
    expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it('uses OAuth redirect on web', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'web' });
    const origin = 'https://champo.example';
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { origin },
    });
    const storage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });

    const { getByRole } = render(
      <GoogleAuth setIsLoading={jest.fn()} isLoading={false} mode="signIn" legalAccepted />,
    );
    fireEvent.press(getByRole('button'));
    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: origin },
      });
    });
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
  });

  it('records server-side legal acceptance after native authentication', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const { getByRole } = render(
      <GoogleAuth setIsLoading={jest.fn()} isLoading={false} mode="signUp" legalAccepted />,
    );
    fireEvent.press(getByRole('button'));
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('record_current_legal_acceptance', {
        p_source: 'google',
        p_auth_flow: 'sign_up',
        p_locale: 'en',
        p_app_version: expect.any(String),
      });
    });
  });

  it('does not call Google sign in when loading', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const { getByRole } = render(
      <GoogleAuth setIsLoading={jest.fn()} isLoading mode="signIn" legalAccepted />,
    );
    fireEvent.press(getByRole('button'));
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
    expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it('does not start social authentication before legal acceptance', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const { getByRole } = render(
      <GoogleAuth setIsLoading={jest.fn()} isLoading={false} mode="signUp" legalAccepted={false} />,
    );
    fireEvent.press(getByRole('button'));
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
  });
});
