import { render } from '@testing-library/react-native';
import LegalDocumentScreen from '../LegalDocumentScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('PrivacyScreen', () => {
  it('renders the policy update date', () => {
    const { getByText } = render(<LegalDocumentScreen document="privacy" />);
    expect(getByText('Last updated: August 26, 2026')).toBeTruthy();
  });

  it('renders data collection section', () => {
    const { getByText } = render(<LegalDocumentScreen document="privacy" />);
    expect(getByText('Information We Collect')).toBeTruthy();
  });

  it('renders contact section', () => {
    const { getByText } = render(<LegalDocumentScreen document="privacy" />);
    expect(getByText('Contact Us')).toBeTruthy();
  });

  it('discloses Google Cloud Vision image moderation and Sentry diagnostics', () => {
    const { getByText } = render(<LegalDocumentScreen document="privacy" />);
    expect(getByText('Google Cloud Vision Image Moderation')).toBeTruthy();
    expect(getByText('Sentry Diagnostics')).toBeTruthy();
  });
});
