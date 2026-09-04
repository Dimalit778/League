// Import setup first to ensure mocks are applied
import { mockAuthActions, mockResendOtp, mockVerifyOtp, resetAuthMocks } from './setup';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import VerifyEmailScreen from '../screens/VerifyEmail';

describe('VerifyEmailScreen', () => {
  beforeEach(() => {
    resetAuthMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ email: 'user@test.com' });
  });

  it('verifies that mocks are working', () => {
    // Simple test to verify the mock setup
    expect(mockVerifyOtp).toBeDefined();
    expect(mockResendOtp).toBeDefined();
    expect(typeof mockVerifyOtp).toBe('function');
    expect(typeof mockResendOtp).toBe('function');
  });

  it('renders the heading and email', () => {
    const { getByText } = render(<VerifyEmailScreen />);

    expect(getByText('Verify your email')).toBeTruthy();
    expect(getByText('user@test.com')).toBeTruthy();
  });

  it('renders 6 code input fields', () => {
    const { getAllByAccessibilityHint } = render(<VerifyEmailScreen />);

    const inputs = getAllByAccessibilityHint('Enter a single digit');
    expect(inputs).toHaveLength(6);
  });

  it('renders the confirmation button', () => {
    const { getByTestId, getByText } = render(<VerifyEmailScreen />);

    expect(getByTestId('button')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
  });

  it('renders the resend code action', () => {
    const { getByText } = render(<VerifyEmailScreen />);

    expect(getByText('Resend Code')).toBeTruthy();
  });

  it('shows missing email message when no email param', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    const { getByText } = render(<VerifyEmailScreen />);

    expect(getByText('Email address is missing')).toBeTruthy();
    expect(getByText('Please try signing up again.')).toBeTruthy();
  });

  it('enables verify button when all 6 digits are entered', async () => {
    const { getAllByAccessibilityHint, getByTestId } = render(<VerifyEmailScreen />);

    const inputs = getAllByAccessibilityHint('Enter a single digit');
    const digits = ['1', '2', '3', '4', '5', '6'];

    // Initially button should be disabled
    expect(getByTestId('button').props.accessibilityState.disabled).toBe(true);

    // Fill in all digits
    for (let i = 0; i < digits.length; i++) {
      fireEvent.changeText(inputs[i], digits[i]);
    }

    // Wait for button to be enabled
    await waitFor(() => {
      expect(getByTestId('button').props.accessibilityState.disabled).toBe(false);
    });

    // Verify the input values are set correctly
    inputs.forEach((input, i) => {
      expect(input.props.value).toBe(digits[i]);
    });
  });

  it('starts a two-minute countdown', () => {
    const { getByText } = render(<VerifyEmailScreen />);

    expect(getByText('02:00')).toBeTruthy();
    expect(getByText('Resend Code')).toBeTruthy();
  });

  it('submits the code for the email supplied by signup', async () => {
    const screen = render(<VerifyEmailScreen />);
    screen.getAllByAccessibilityHint('Enter a single digit').forEach((input, index) => {
      fireEvent.changeText(input, String(index + 1));
    });
    fireEvent.press(screen.getByText('Confirm'));
    await waitFor(() => expect(mockVerifyOtp).toHaveBeenCalledWith('user@test.com', '123456'));
  });

  it('keeps resending disabled during the cooldown', () => {
    const screen = render(<VerifyEmailScreen />);
    expect(screen.getByLabelText('Resend verification code').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByLabelText('Resend verification code'));
    expect(mockResendOtp).not.toHaveBeenCalled();
  });

  it('does not display error message initially', () => {
    // Ensure no error message is set
    mockAuthActions.errorMessage = null;
    mockAuthActions.isError = false;

    const { queryByText } = render(<VerifyEmailScreen />);

    // Should not find any error message
    expect(queryByText('Token has expired or is invalid')).toBeNull();
    expect(queryByText('Invalid code')).toBeNull();
  });
});
