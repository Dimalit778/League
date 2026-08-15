import { fireEvent, render } from '@testing-library/react-native';
import { mockAuthActions, resetAuthMocks } from './setup';
import SendResetLink from '../screens/ForgotPasswordScreen';

describe('SendResetLink', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  it('renders the heading and description', () => {
    const { getByText } = render(<SendResetLink />);

    expect(getByText('Forgot your password?')).toBeTruthy();
    expect(getByText("Enter your email address and we'll send you a reset link")).toBeTruthy();
  });

  it('renders email input field', () => {
    const { getByPlaceholderText } = render(<SendResetLink />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders the Send Reset Link button', () => {
    const { getByText } = render(<SendResetLink />);

    expect(getByText('Send Reset Link')).toBeTruthy();
    expect(getByText('Back to Sign In')).toBeTruthy();
    expect(getByText('Contact support')).toBeTruthy();
  });

  it('renders a back button', () => {
    const { getByLabelText } = render(<SendResetLink />);

    expect(getByLabelText('Back')).toBeTruthy();
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

  it('renders an auth error inside a Text component', () => {
    mockAuthActions.errorMessage = 'Too many reset attempts';

    const { getByText } = render(<SendResetLink />);

    expect(getByText('Too many reset attempts')).toBeTruthy();
  });
});
