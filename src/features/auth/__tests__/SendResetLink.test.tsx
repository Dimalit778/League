import { fireEvent, render, waitFor } from '@testing-library/react-native';
import SendResetLink from '../screens/SendResetLink';
import { mockAuthActions, mockSendResetPasswordLink, resetAuthMocks } from './setup';

describe('SendResetLink', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  it('renders the heading and description', () => {
    const { getByText } = render(<SendResetLink />);

    expect(getByText('Reset Password')).toBeTruthy();
    expect(getByText("Enter your email address and we'll send you a reset link")).toBeTruthy();
  });

  it('renders email input field', () => {
    const { getByPlaceholderText } = render(<SendResetLink />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders the Send Reset Link button', () => {
    const { getByText } = render(<SendResetLink />);

    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  it('renders a back button', () => {
    const { getByTestId } = render(<SendResetLink />);

    expect(getByTestId('lucide-icon')).toBeTruthy();
  });

  it('enables button when valid email is entered', async () => {
    const { getByPlaceholderText, getByTestId } = render(<SendResetLink />);

    // Initially button should be enabled (no validation on this form)
    expect(getByTestId('button').props.accessibilityState?.disabled).not.toBe(true);

    // Fill in email
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@test.com');

    // Button should remain enabled
    expect(getByTestId('button').props.accessibilityState?.disabled).not.toBe(true);
  });

  it('does not display error message initially', () => {
    // Ensure no error message is set
    mockAuthActions.errorMessage = null;
    mockAuthActions.isError = false;

    const { queryByText } = render(<SendResetLink />);

    // Should not find any error message
    expect(queryByText('User not found')).toBeNull();
    expect(queryByText('Invalid email')).toBeNull();
  });
});
