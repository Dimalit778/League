import { fireEvent, render } from '@testing-library/react-native';
import LanguageToggle from '../LanguageToggle';

const mockToggleLanguage = jest.fn();

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
    toggleLanguage: mockToggleLanguage,
    isRTL: false,
  }),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders EN and Hebrew labels', () => {
    const { getAllByText, getByText } = render(<LanguageToggle />);
    expect(getAllByText('EN').length).toBeGreaterThan(0);
    expect(getByText('עב')).toBeTruthy();
  });

  it('calls toggleLanguage when pressed', () => {
    const { getByRole } = render(<LanguageToggle />);
    fireEvent.press(getByRole('switch'));
    expect(mockToggleLanguage).toHaveBeenCalledTimes(1);
  });
});
