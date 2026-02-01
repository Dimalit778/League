import { render } from '@testing-library/react-native';
import { CText } from '../CText';

jest.mock('@/lib/nativeWind', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('CText', () => {
  it('renders text content', () => {
    const { getByText } = render(<CText>Hello World</CText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with default body variant', () => {
    const { getByText } = render(<CText>Body text</CText>);
    expect(getByText('Body text')).toBeTruthy();
  });

  it('renders with h1 variant', () => {
    const { getByText } = render(<CText variant="h1">Heading</CText>);
    expect(getByText('Heading')).toBeTruthy();
  });

  it('renders with h2 variant', () => {
    const { getByText } = render(<CText variant="h2">Subheading</CText>);
    expect(getByText('Subheading')).toBeTruthy();
  });

  it('renders with caption variant', () => {
    const { getByText } = render(<CText variant="caption">Caption</CText>);
    expect(getByText('Caption')).toBeTruthy();
  });

  it('renders with small variant', () => {
    const { getByText } = render(<CText variant="small">Small text</CText>);
    expect(getByText('Small text')).toBeTruthy();
  });

  it('renders with bold prop', () => {
    const { getByText } = render(<CText bold>Bold text</CText>);
    expect(getByText('Bold text')).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { getByText } = render(<CText className="text-red-500">Styled</CText>);
    expect(getByText('Styled')).toBeTruthy();
  });

  it('passes extra TextProps through', () => {
    const { getByText } = render(<CText numberOfLines={1}>Truncated</CText>);
    expect(getByText('Truncated')).toBeTruthy();
  });
});
