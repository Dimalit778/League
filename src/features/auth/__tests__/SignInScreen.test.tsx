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

    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('renders sign in button as enabled when form is valid', async () => {
    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);

    // Fill in email and password
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Wait for form validation
    await waitFor(() => {
      const button = getByTestId('button');
      expect(button.props.accessibilityState?.disabled).not.toBe(true);
    });
  });

  it('does not display error message initially', () => {
    // Ensure no error message is set
    mockAuthActions.errorMessage = null;
    mockAuthActions.isError = false;

    const { queryByText } = render(<SignInScreen />);

    // Should not find any error message
    expect(queryByText('Invalid credentials')).toBeNull();
    expect(queryByText('User not found')).toBeNull();
  });

  it('renders password toggle functionality', () => {
    const { getByLabelText } = render(<SignInScreen />);

    const passwordToggle = getByLabelText('Toggle password visibility');
    expect(passwordToggle).toBeTruthy();
  });
});
