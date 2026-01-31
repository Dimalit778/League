import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { mockVerifyOtp, mockResendOtp, resetAuthMocks, mockAuthActions } from './setup';
import VerifyEmailScreen from '../screens/VerifyEmail';

describe('VerifyEmailScreen', () => {
  beforeEach(() => {
    resetAuthMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ email: 'user@test.com' });
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

  it('calls verifyOtp when Verify Email button is pressed with valid code', async () => {
    const { getAllByAccessibilityHint, getByTestId } = render(<VerifyEmailScreen />);

    const inputs = getAllByAccessibilityHint('Enter a single digit');
    const digits = ['1', '2', '3', '4', '5', '6'];

    digits.forEach((digit, i) => {
      fireEvent.changeText(inputs[i], digit);
    });

    // Press the verify button manually
    fireEvent.press(getByTestId('button'));

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith('user@test.com', '123456');
    });
  });

  it('calls resendOtp when Resend Code is pressed', async () => {
    const { getByText } = render(<VerifyEmailScreen />);

    fireEvent.press(getByText('Resend Code'));

    await waitFor(() => {
      expect(mockResendOtp).toHaveBeenCalledWith('user@test.com');
    });
  });

  it('displays error message when verification fails', () => {
    mockAuthActions.errorMessage = 'Invalid code';

    const { getByText } = render(<VerifyEmailScreen />);

    expect(getByText('Invalid code')).toBeTruthy();
  });
});
