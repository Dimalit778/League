import { fireEvent, render } from '@testing-library/react-native';
import GoogleSignInButton from '../GoogleSignInButton';

describe('GoogleSignInButton', () => {
  it('renders default label', () => {
    const { getByText } = render(<GoogleSignInButton onPress={jest.fn()} />);
    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('renders custom label', () => {
    const { getByText } = render(<GoogleSignInButton label="Continue with Google" onPress={jest.fn()} />);
    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<GoogleSignInButton onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<GoogleSignInButton onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<GoogleSignInButton onPress={onPress} loading />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
