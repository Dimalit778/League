import { render } from '@testing-library/react-native';
import PrivacyScreen from '../../screens/PrivacyScreen';

describe('PrivacyScreen', () => {
  it('renders privacy policy sections', () => {
    const { getByText } = render(<PrivacyScreen />);
    expect(getByText('Introduction')).toBeTruthy();
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
