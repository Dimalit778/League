import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { mockSendResetPasswordLink, resetAuthMocks, mockAuthActions } from './setup';
import SendResetLink from '../screens/SendResetLink';

describe('SendResetLink', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  it('renders the heading and description', () => {
    const { getByText } = render(<SendResetLink />);

    expect(getByText('Reset Password')).toBeTruthy();
    expect(
      getByText("Enter your email address and we'll send you a reset link")
    ).toBeTruthy();
  });

  it('renders email input field', () => {
    const { getByPlaceholderText } = render(<SendResetLink />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders the Send Reset Link button', () => {
    const { getByText } = render(<SendResetLink />);

    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  it('renders Back to Sign In link', () => {
    const { getByText } = render(<SendResetLink />);

    expect(getByText('Back to Sign In')).toBeTruthy();
  });

  it('calls sendResetPasswordLink on valid submit', async () => {
    const { getByPlaceholderText, getByTestId } = render(<SendResetLink />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@test.com');

    await waitFor(() => {
      expect(getByTestId('button')).not.toBeDisabled();
    });

    fireEvent.press(getByTestId('button'));

    await waitFor(() => {
      expect(mockSendResetPasswordLink).toHaveBeenCalledWith('user@test.com');
    });
  });

  it('displays error message on failure', () => {
    mockAuthActions.errorMessage = 'User not found';

    const { getByText } = render(<SendResetLink />);

    expect(getByText('User not found')).toBeTruthy();
  });
});
