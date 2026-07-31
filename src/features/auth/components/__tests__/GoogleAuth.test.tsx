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

  it('renders sign in label', () => {
    const { getByText } = render(<GoogleAuth setIsLoading={jest.fn()} isLoading={false} />);
    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('calls Google sign in when pressed on native', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const setIsLoading = jest.fn();
    const { getByRole } = render(<GoogleAuth setIsLoading={setIsLoading} isLoading={false} />);
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

    const { getByRole } = render(<GoogleAuth setIsLoading={jest.fn()} isLoading={false} />);
    fireEvent.press(getByRole('button'));
    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: origin },
      });
    });
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
  });

  it('does not call Google sign in when loading', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });
    const { getByRole } = render(<GoogleAuth setIsLoading={jest.fn()} isLoading />);
    fireEvent.press(getByRole('button'));
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
    expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
  });
});
