import { render } from '@testing-library/react-native';
import HelpScreen from '../../screens/HelpScreen';

jest.mock('@expo/vector-icons', () => ({
  FontAwesome6: () => null,
}));

describe('HelpScreen', () => {
  it('renders the welcome intro', () => {
    const { getByText } = render(<HelpScreen />);
    expect(
      getByText(
        'League is a football prediction app where you compete with friends by predicting match results. Create or join leagues, make predictions, and climb the leaderboard!',
      ),
    ).toBeTruthy();
  });

  it('renders help sections', () => {
    const { getByText } = render(<HelpScreen />);
    expect(getByText('Getting Started')).toBeTruthy();
    expect(getByText('Making Predictions')).toBeTruthy();
  });

  it('renders contact support section', () => {
    const { getByText } = render(<HelpScreen />);
    expect(getByText('Contact Support')).toBeTruthy();
    expect(getByText('support@champoapp.com')).toBeTruthy();
  });

  it('renders app information section', () => {
    const { getByText } = render(<HelpScreen />);
    expect(getByText('App Information')).toBeTruthy();
    expect(getByText('Football data provided by the Football-Data.org API')).toBeTruthy();
  });
});
