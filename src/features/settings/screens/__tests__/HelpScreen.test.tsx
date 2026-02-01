import { render } from '@testing-library/react-native';
import HelpScreen from '../../screens/HelpScreen';

jest.mock('@expo/vector-icons', () => ({
  FontAwesome6: () => null,
}));

describe('HelpScreen', () => {
  it('renders the help heading', () => {
    const { getByText } = render(<HelpScreen />);
    expect(getByText('Welcome to League Champion')).toBeTruthy();
  });

  it('renders help sections', () => {
    const { getByText } = render(<HelpScreen />);
    expect(getByText('Getting Started')).toBeTruthy();
    expect(getByText('Making Predictions')).toBeTruthy();
  });

  it('renders contact support section', () => {
    const { getByText } = render(<HelpScreen />);
    expect(getByText('Contact Support')).toBeTruthy();
    expect(getByText('Email Support')).toBeTruthy();
  });

  it('renders app information section', () => {
    const { getByText } = render(<HelpScreen />);
    expect(getByText('App Information')).toBeTruthy();
  });
});
