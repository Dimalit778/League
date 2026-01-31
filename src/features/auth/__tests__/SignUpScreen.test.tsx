import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { mockSignUp, resetAuthMocks, mockAuthActions } from './setup';
import SignUpScreen from '../screens/SignUpScreen';

describe('SignUpScreen', () => {
  beforeEach(() => {
    resetAuthMocks();
    (router.push as jest.Mock).mockReset();
  });

  it('renders the heading and subheading', () => {
    const { getByText } = render(<SignUpScreen />);

    expect(getByText('Create account')).toBeTruthy();
    expect(getByText('Sign up to get started')).toBeTruthy();
  });

  it('renders fullname, email, and password fields', () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);

    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders the Sign Up button', () => {
    const { getByText } = render(<SignUpScreen />);

    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('renders link to Sign In', () => {
    const { getByText } = render(<SignUpScreen />);

    expect(getByText('Sign In')).toBeTruthy();
  });

  it('renders Google Sign In option', () => {
    const { getByText } = render(<SignUpScreen />);

    expect(getByText('Google Sign In')).toBeTruthy();
  });

  it('calls signUp and navigates to verifyEmail on success', async () => {
    mockSignUp.mockResolvedValueOnce({ success: true });

    const { getByPlaceholderText, getByTestId } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'john@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Wait for async yup validation to mark form as valid
    await waitFor(() => {
      expect(getByTestId('button')).not.toBeDisabled();
    });

    fireEvent.press(getByTestId('button'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('john@test.com', 'password123', 'John Doe');
    });

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/verifyEmail',
        params: { email: 'john@test.com' },
      });
    });
  });

  it('displays error message when signUp fails', () => {
    mockAuthActions.errorMessage = 'Email already exists';

    const { getByText } = render(<SignUpScreen />);

    expect(getByText('Email already exists')).toBeTruthy();
  });
});
