import { render } from '@testing-library/react-native';
import LegalDocumentScreen from '../../components/LegalDocumentScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('TermsScreen', () => {
  it('renders terms heading', () => {
    const { getAllByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getAllByText('Terms of Service').length).toBeGreaterThan(0);
  });

  it('renders subscriptions section', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Subscriptions and Payments')).toBeTruthy();
  });

  it('renders Apple terms section', () => {
    const { getByText } = render(<LegalDocumentScreen document="terms" />);
    expect(getByText('Apple Terms')).toBeTruthy();
  });
});
