import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import GoogleAuth from '../GoogleAuth';

describe('GoogleAuth', () => {
  it('renders sign in label', () => {
    const { getByText } = render(<GoogleAuth setIsLoading={jest.fn()} isLoading={false} />);
    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('calls Google sign in when pressed', async () => {
    const setIsLoading = jest.fn();
    const { getByRole } = render(<GoogleAuth setIsLoading={setIsLoading} isLoading={false} />);
    fireEvent.press(getByRole('button'));
    await waitFor(() => {
      expect(GoogleSignin.signIn).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call Google sign in when loading', () => {
    const { getByRole } = render(<GoogleAuth setIsLoading={jest.fn()} isLoading />);
    fireEvent.press(getByRole('button'));
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
  });
});
