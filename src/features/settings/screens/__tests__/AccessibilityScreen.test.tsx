import { render } from '@testing-library/react-native';
import LegalDocumentScreen from '../LegalDocumentScreen';

describe('AccessibilityScreen', () => {
  it('publishes the review date and feedback channel', () => {
    const { getByText } = render(<LegalDocumentScreen document="accessibility" />);

    expect(getByText('Last reviewed: August 26, 2026')).toBeTruthy();
    expect(getByText('Accessibility Feedback')).toBeTruthy();
    expect(getByText('Accessibility feedback: support@champoapp.com')).toBeTruthy();
  });

  it('marks every section title as a heading', () => {
    const { getAllByRole } = render(<LegalDocumentScreen document="accessibility" />);

    expect(getAllByRole('header')).toHaveLength(5);
  });
});
