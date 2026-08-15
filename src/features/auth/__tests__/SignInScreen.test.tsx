import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import SignInScreen from '../screens/SignInScreen';
import { mockAuthActions, resetAuthMocks } from './setup';

describe('SignInScreen', () => {
  beforeEach(() => {
    resetAuthMocks();
    (router.push as jest.Mock).mockReset();
    globalThis.testFormValues = {};
  });

  it('renders the heading', () => {
    const { getByText } = render(<SignInScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
  });

  it('renders email and password input fields', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders the Sign In button', () => {
    const { getByTestId } = render(<SignInScreen />);

    expect(getByTestId('button')).toBeTruthy();
  });

  it('renders Forgot Password link', () => {
    const { getByText } = render(<SignInScreen />);

    expect(getByText('Forgot Password')).toBeTruthy();
  });

  it('switches to sign up form when toggle is pressed', () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    fireEvent.press(getByText('Sign Up'));

    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByText('Create account')).toBeTruthy();
  });

  it('renders the icon-only social sign in group', () => {
    const { getByText, getByTestId } = render(<SignInScreen />);

    expect(getByText('OR')).toBeTruthy();
    expect(getByTestId('google-sign-in-button')).toBeTruthy();
  });

  it('renders a mode-switch prompt for new users', () => {
    const { getByText } = render(<SignInScreen />);

    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
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
