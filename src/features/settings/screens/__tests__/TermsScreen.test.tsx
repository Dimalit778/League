import { render } from '@testing-library/react-native';
import LegalDocumentScreen from '../LegalDocumentScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('TermsScreen', () => {
  it('renders the terms update date', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Last updated: August 27, 2026')).toBeTruthy();
  });

  it('renders Free Access section', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Free Access')).toBeTruthy();
  });

  it('renders Apple App Store terms section', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Apple App Store Terms')).toBeTruthy();
  });
});
