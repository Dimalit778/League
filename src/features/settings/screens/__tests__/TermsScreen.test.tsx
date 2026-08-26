import { render } from '@testing-library/react-native';
import LegalDocumentScreen from '../LegalDocumentScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('TermsScreen', () => {
  it('renders the terms update date', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Last updated: August 26, 2026')).toBeTruthy();
  });

  it('renders Season Pass section', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Season Pass and Payments')).toBeTruthy();
  });

  it('renders Apple terms section', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Apple Terms')).toBeTruthy();
  });
});
