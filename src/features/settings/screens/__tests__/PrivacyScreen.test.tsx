import { render } from '@testing-library/react-native';
import PrivacyScreen from '../../screens/PrivacyScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('PrivacyScreen', () => {
  it('renders privacy policy sections', () => {
    const { getAllByText } = render(<PrivacyScreen />);
    expect(getAllByText('Privacy Policy').length).toBeGreaterThan(0);
  });

  it('renders data collection section', () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText('Information We Collect')).toBeTruthy();
  });

  it('renders contact section', () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText('Contact Us')).toBeTruthy();
  });
});
