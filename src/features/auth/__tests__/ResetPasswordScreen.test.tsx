import { render } from '@testing-library/react-native';
import './setup';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

describe('ResetPasswordScreen', () => {
  it('renders the heading and description', () => {
    const { getByText } = render(<ResetPasswordScreen />);

    expect(getByText('New Password')).toBeTruthy();
    expect(getByText('Enter your new password')).toBeTruthy();
  });

  it('renders password and confirm password fields', () => {
    const { getByPlaceholderText } = render(<ResetPasswordScreen />);

    expect(getByPlaceholderText('New Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('renders the Save New Password button', () => {
    const { getByText } = render(<ResetPasswordScreen />);

    expect(getByText('Save New Password')).toBeTruthy();
  });

  it('renders the password strength meter', () => {
    const { getByLabelText } = render(<ResetPasswordScreen />);

    expect(getByLabelText('Password strength')).toBeTruthy();
  });
});
