import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import SignInScreen from '../screens/SignInScreen';
import { mockAuthActions, mockSignIn, resetAuthMocks } from './setup';

describe('SignInScreen', () => {
  beforeEach(() => {
    resetAuthMocks();
    (router.push as jest.Mock).mockReset();
    (global as any).testFormValues = {};
  });

  it('renders the heading and subheading', () => {
    const { getByText } = render(<SignInScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to your account')).toBeTruthy();
  });

  it('renders email and password input fields', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders the Sign In button', () => {
    const { getByText } = render(<SignInScreen />);

    expect(getByText('Sign In')).toBeTruthy();
  });

  it('renders links to Sign Up and Forgot Password', () => {
    const { getByText } = render(<SignInScreen />);

    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Forgot Password')).toBeTruthy();
  });

  it('renders Google Sign In option', () => {
    const { getByText } = render(<SignInScreen />);

    expect(getByText('Google Sign In')).toBeTruthy();
  });

  it('calls signIn with email and password on valid submit', async () => {
    global.testFormValues = {
      email: 'user@test.com',
      password: 'password123',
    };

    const { getByTestId } = render(<SignInScreen />);

    fireEvent.press(getByTestId('button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'password123');
    });
  });

  it('displays error message when signIn fails', () => {
    mockAuthActions.errorMessage = 'Invalid credentials';

    const { getByText } = render(<SignInScreen />);

    expect(getByText('Invalid credentials')).toBeTruthy();
  });

  it('navigates to verifyEmail when email is not confirmed', async () => {
    mockSignIn.mockResolvedValueOnce({
      success: false,
      error: 'Email not confirmed',
    });

    global.testFormValues = {
      email: 'user@test.com',
      password: 'password123',
    };

    const { getByTestId } = render(<SignInScreen />);

    fireEvent.press(getByTestId('button'));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/verifyEmail',
        params: { email: 'user@test.com' },
      });
    });
  });
});
