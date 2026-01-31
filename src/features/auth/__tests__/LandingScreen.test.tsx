import { render } from '@testing-library/react-native';
import LandingScreen from '../screens/LandingScreen';

jest.mock('@assets/images/football-bg.png', () => 'football-bg');

describe('LandingScreen', () => {
  it('renders the app title', () => {
    const { getByText } = render(<LandingScreen />);

    expect(getByText('League')).toBeTruthy();
    expect(getByText('Champion')).toBeTruthy();
  });

  it('renders the tagline', () => {
    const { getByText } = render(<LandingScreen />);

    expect(getByText('Predict. Compete. Win.')).toBeTruthy();
  });

  it('renders the Get Started link', () => {
    const { getByText } = render(<LandingScreen />);

    expect(getByText('Get Started')).toBeTruthy();
  });
});
