import { render } from '@testing-library/react-native';
import LandingScreen from '../screens/LandingScreen';

jest.mock('@/assets/images', () => ({
  images: { bgWelcome: 1 },
}));

describe('LandingScreen', () => {
  it('renders the value proposition', () => {
    const { getByText } = render(<LandingScreen />);

    expect(getByText('Every match is a challenge')).toBeTruthy();
    expect(getByText('Predict scores, compete with friends, and climb the table.')).toBeTruthy();
  });

  it('renders the Get Started link', () => {
    const { getByText } = render(<LandingScreen />);

    expect(getByText('Get Started')).toBeTruthy();
  });

  it('renders the returning-user sign-in action', () => {
    const { getByText } = render(<LandingScreen />);

    expect(getByText('Already have an account?')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });
});
