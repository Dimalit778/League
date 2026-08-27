import { render } from '@testing-library/react-native';
import LegalDocumentScreen from '../LegalDocumentScreen';

describe('AccessibilityScreen', () => {
  it('publishes the review date and feedback channel', () => {
    const { getByText } = render(<LegalDocumentScreen document="accessibility" />);

    expect(getByText('Last reviewed: August 27, 2026')).toBeTruthy();
    expect(getByText('Accessibility Feedback')).toBeTruthy();
    expect(getByText('Accessibility feedback:')).toBeTruthy();
    expect(getByText('support@champoapp.com')).toBeTruthy();
  });

  it('renders every section title', () => {
    const { getByText } = render(<LegalDocumentScreen document="accessibility" />);

    for (const title of [
      'Accessibility Approach',
      'Accessibility Features',
      'Review and Testing',
      'Known Limitations',
      'Accessibility Feedback',
    ]) {
      expect(getByText(title)).toBeTruthy();
    }
  });
});
