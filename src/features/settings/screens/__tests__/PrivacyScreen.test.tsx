import { render } from '@testing-library/react-native';
import LegalDocumentScreen from '../../components/LegalDocumentScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('PrivacyScreen', () => {
  it('renders privacy policy sections', () => {
    const { getAllByText } = render(<LegalDocumentScreen document="privacy" />);
    expect(getAllByText('Privacy Policy').length).toBeGreaterThan(0);
  });

  it('renders data collection section', () => {
    const { getByText } = render(<LegalDocumentScreen document="privacy" />);
    expect(getByText('Information We Collect')).toBeTruthy();
  });

  it('renders contact section', () => {
    const { getByText } = render(<LegalDocumentScreen document="privacy" />);
    expect(getByText('Contact Us')).toBeTruthy();
  });
});
