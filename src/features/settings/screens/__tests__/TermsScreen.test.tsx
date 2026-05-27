import { render } from '@testing-library/react-native';
import TermsScreen from '../../screens/TermsScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('TermsScreen', () => {
  it('renders terms heading', () => {
    const { getAllByText } = render(<TermsScreen />);
    expect(getAllByText('Terms of Service').length).toBeGreaterThan(0);
  });

  it('renders subscriptions section', () => {
    const { getByText } = render(<TermsScreen />);
    expect(getByText('Subscriptions and Payments')).toBeTruthy();
  });

  it('renders Apple terms section', () => {
    const { getByText } = render(<TermsScreen />);
    expect(getByText('Apple Terms')).toBeTruthy();
  });
});
