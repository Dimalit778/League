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
    const { getAllByText, getByText } = render(<VerifyEmailScreen />);

    // "Verify Email" appears as both heading and button
    expect(getAllByText('Verify Email').length).toBeGreaterThanOrEqual(1);
    expect(getByText('user@test.com')).toBeTruthy();
  });

  it('renders 6 code input fields', () => {
    const { getAllByAccessibilityHint } = render(<VerifyEmailScreen />);

    const inputs = getAllByAccessibilityHint('Enter a single digit');
    expect(inputs).toHaveLength(6);
  });

  it('renders the Verify Email button', () => {
    const { getByTestId } = render(<VerifyEmailScreen />);

    expect(getByTestId('button')).toBeTruthy();
  });

  it('renders the Resend Code button', () => {
    const { getByText } = render(<VerifyEmailScreen />);

    expect(getByText('Resend Code')).toBeTruthy();
  });

  it('shows missing email message when no email param', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    const { getByText } = render(<VerifyEmailScreen />);

    expect(getByText('Email address is missing. Please try signing up again.')).toBeTruthy();
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

  it('renders resend button as enabled initially', () => {
    const { getByText } = render(<VerifyEmailScreen />);

    const resendButton = getByText('Resend Code');
    expect(resendButton).toBeTruthy();
    
    // Check that the resend button is not disabled initially
    const resendButtonContainer = resendButton.parent;
    expect(resendButtonContainer?.props.accessibilityState?.disabled).not.toBe(true);
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
